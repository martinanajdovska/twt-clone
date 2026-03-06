import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';
import { NotificationType } from 'src/entities/notification.entity';
import { UsersService } from 'src/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TweetsService } from 'src/tweets/tweets.service';
import { LikesService } from 'src/likes/likes.service';
import { RetweetsService } from 'src/retweets/retweets.service';
import { Repository, In } from 'typeorm';
import { NoteWithRatings } from './type/note-with-rating.type';

@Injectable()
export class CommunityNotesService {
  private readonly HELPFUL_THRESHOLD = 2;

  constructor(
    @InjectRepository(CommunityNote)
    private readonly noteRepo: Repository<CommunityNote>,
    @InjectRepository(NoteRating)
    private readonly ratingRepo: Repository<NoteRating>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => TweetsService))
    private readonly tweetsService: TweetsService,
    private readonly likesService: LikesService,
    private readonly retweetsService: RetweetsService,
  ) {}

  async submitNote(tweetId: number, author: string, content: string) {
    const user = await this.usersService.findByUsername(author);
    if (!user) throw new NotFoundException('User not found');

    const note = this.noteRepo.create({
      tweet: { id: tweetId },
      content: content,
      author: user,
    });
    return this.noteRepo.save(note);
  }

  async rateNote(noteId: number, username: string, isHelpful: boolean) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.ratingRepo.findOne({
      where: { note: { id: noteId }, user: { id: user.id } },
    });

    const note = await this.noteRepo.findOne({
      where: { id: noteId },
      relations: ['author', 'tweet'],
    });

    if (!note) throw new NotFoundException('Note not found');

    if (note.author.id === user.id)
      throw new BadRequestException("Can't rate your own note");

    if (existing) {
      if (existing.isHelpful === isHelpful) return;
      else existing.isHelpful = isHelpful;

      await this.ratingRepo.save(existing);
    } else {
      await this.ratingRepo.save({
        note: { id: noteId },
        user,
        isHelpful,
      });
    }

    await this.updateVisibility(note);
  }

  private async updateVisibility(note: CommunityNote) {
    const ratings = await this.ratingRepo.find({
      where: { note: { id: note.id } },
    });
    const helpfulCount = ratings.filter((r) => r.isHelpful).length;
    const notHelpfulCount = ratings.filter((r) => !r.isHelpful).length;
    const shouldBeVisible =
      helpfulCount >= this.HELPFUL_THRESHOLD && helpfulCount > notHelpfulCount;

    if (note.isVisible !== shouldBeVisible) {
      note.isVisible = shouldBeVisible;
      await this.noteRepo.save(note);

      if (shouldBeVisible && note.tweet) {
        await this.notifyEngagers(note);
      }
    }
  }

  private async notifyEngagers(note: CommunityNote): Promise<void> {
    const tweetId = note.tweet.id;
    const noteAuthorUsername = note.author.username;

    const [replyAuthors, likers, retweeters] = await Promise.all([
      this.tweetsService.findReplyAuthorUsernamesByTweetId(tweetId),
      this.likesService.findLikerUsernamesByTweetId(tweetId),
      this.retweetsService.findRetweeterUsernamesByTweetId(tweetId),
    ]);

    const usernames = new Set<string>([
      ...replyAuthors,
      ...likers,
      ...retweeters,
    ]);
    usernames.delete(noteAuthorUsername);

    const message = 'A Community Note was added to a tweet you engaged with';
    const link = `/tweets/${tweetId}`;

    await Promise.all(
      Array.from(usernames).map((username) =>
        this.notificationsService.createNotification(
          username,
          'Community',
          message,
          link,
          NotificationType.COMMUNITY_NOTE,
        ),
      ),
    );
  }

  private async getRatingsByNoteId(
    noteIds: number[],
  ): Promise<Map<number, NoteRating[]>> {
    if (noteIds.length === 0) return new Map();

    const ratings = await this.ratingRepo.find({
      where: { note: { id: In(noteIds) } },
      relations: ['user', 'note'],
    });
    const map = new Map<number, NoteRating[]>();

    for (const r of ratings) {
      if (r.note?.id == null) continue;
      const list = map.get(r.note.id) ?? [];
      list.push(r);
      map.set(r.note.id, list);
    }

    return map;
  }

  async getNotesWithRatingsByTweetId(
    tweetId: number,
  ): Promise<NoteWithRatings[]> {
    const notes = await this.noteRepo.find({
      where: { tweet: { id: tweetId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    if (notes.length === 0) return [];

    const ratingsByNoteId = await this.getRatingsByNoteId(
      notes.map((n) => n.id),
    );

    return notes.map((n) => ({
      ...n,
      ratings: ratingsByNoteId.get(n.id) ?? [],
    }));
  }

  async getMostHelpfulNoteWithRating(
    tweetId: number,
  ): Promise<NoteWithRatings | null>;
  async getMostHelpfulNoteWithRating(
    tweetIds: number[],
  ): Promise<Map<number, NoteWithRatings | null>>;
  async getMostHelpfulNoteWithRating(
    tweetIdOrIds: number | number[],
  ): Promise<NoteWithRatings | null | Map<number, NoteWithRatings | null>> {
    if (typeof tweetIdOrIds === 'number') {
      const notes = await this.noteRepo.find({
        where: { tweet: { id: tweetIdOrIds }, isVisible: true },
        relations: ['author'],
      });
      if (notes.length === 0) return null;

      const ratingsByNoteId = await this.getRatingsByNoteId(
        notes.map((n) => n.id),
      );

      return notes
        .map((n) => ({ ...n, ratings: ratingsByNoteId.get(n.id) ?? [] }))
        .sort(
          (a, b) =>
            b.ratings.filter((r) => r.isHelpful).length -
            a.ratings.filter((r) => r.isHelpful).length,
        )[0];
    }

    if (tweetIdOrIds.length === 0) return new Map();

    const notes = await this.noteRepo.find({
      where: { tweet: { id: In(tweetIdOrIds) }, isVisible: true },
      relations: ['author', 'tweet'],
      order: { createdAt: 'DESC' },
    });
    if (notes.length === 0) {
      return new Map(tweetIdOrIds.map((id) => [id, null]));
    }

    const ratingsByNoteId = await this.getRatingsByNoteId(
      notes.map((n) => n.id),
    );

    const notesWithRatings: NoteWithRatings[] = notes.map((n) => ({
      ...n,
      ratings: ratingsByNoteId.get(n.id) ?? [],
    }));

    // group all notes with ratings by tweet
    const notesWithRatingsByTweetId = new Map<number, NoteWithRatings[]>();
    for (const n of notesWithRatings) {
      const list = notesWithRatingsByTweetId.get(n.tweet.id) ?? [];
      list.push(n);
      notesWithRatingsByTweetId.set(n.tweet.id, list);
    }

    const result = new Map<number, NoteWithRatings | null>();

    // get the most helpful note for each tweet
    for (const id of tweetIdOrIds) {
      const list = notesWithRatingsByTweetId.get(id) ?? [];
      result.set(
        id,
        list.sort(
          (a, b) =>
            b.ratings.filter((r) => r.isHelpful).length -
            a.ratings.filter((r) => r.isHelpful).length,
        )[0] ?? null,
      );
    }
    return result;
  }

  async getAllNotesForTweetDto(tweetId: number, currentUsername: string) {
    const notes = await this.getNotesWithRatingsByTweetId(tweetId);

    return notes.map((n) => ({
      id: n.id,
      content: n.content,
      isVisible: n.isVisible,
      authorUsername: n.author!.username,
      helpfulCount: n.ratings.filter((r) => r.isHelpful).length,
      notHelpfulCount: n.ratings.filter((r) => !r.isHelpful).length,
      isHelpful:
        n.ratings.find((r) => r.user?.username === currentUsername)
          ?.isHelpful ?? null,
    }));
  }
}
