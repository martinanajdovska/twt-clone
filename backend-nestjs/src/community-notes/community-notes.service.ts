import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';
import { NotificationType } from 'src/entities/notification.entity';
import { UsersService } from 'src/users/users.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TweetsService } from 'src/tweets/tweets.service';
import { LikesService } from 'src/likes/likes.service';
import { RetweetsService } from 'src/retweets/retweets.service';
import { Repository } from 'typeorm';

@Injectable()
export class CommunityNotesService {
  private readonly HELPFUL_THRESHOLD = 2;

  constructor(
    @InjectRepository(CommunityNote) private noteRepo: Repository<CommunityNote>,
    @InjectRepository(NoteRating) private ratingRepo: Repository<NoteRating>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private tweetsService: TweetsService,
    private likesService: LikesService,
    private retweetsService: RetweetsService,
  ) {}

  async submitNote(tweetId: number, author: string, content: string) {
    const user = await this.usersService.findByUsername(author);
    if (!user) throw new NotFoundException('User not found');

    const note = this.noteRepo.create({ tweet: { id: tweetId }, content: content, author: user, ratings: [] });
    return this.noteRepo.save(note);
  }

  async rateNote(noteId: number, username: string, helpful: boolean) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.ratingRepo.findOne({
      where: { note: { id: noteId }, user: { id: user.id } }
    });

    const note = await this.noteRepo.findOne({
      where: { id: noteId },
      relations: ['author', 'ratings', 'tweet'],
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.author.id === user.id) throw new BadRequestException("Can't rate your own note");

    if (existing) {
        if (existing.helpful === helpful) return;
        else existing.helpful = helpful;
        await this.ratingRepo.save(existing);
        await this.updateVisibility(note);
    } else {
        await this.ratingRepo.save({ note: { id: noteId }, user, helpful });
        await this.updateVisibility(note);
    }
  }

  private async updateVisibility(note: CommunityNote) {
    const ratings = await this.ratingRepo.find({ where: { note: { id: note.id } } });
    const helpfulCount = ratings.filter(r => r.helpful).length;
    const notHelpfulCount = ratings.filter(r => !r.helpful).length;

    const shouldBeVisible = helpfulCount >= this.HELPFUL_THRESHOLD && helpfulCount > notHelpfulCount;

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

  async getNotesForTweet(tweetId: number) {
    return this.noteRepo.find({
      where: { tweet: { id: tweetId }, isVisible: true },
      relations: ['author', 'ratings'],
    });
  }

  async getAllNotesForTweet(tweetId: number, currentUsername: string) {
    const notes = await this.noteRepo.find({
      where: { tweet: { id: tweetId } },
      relations: ['author', 'ratings', 'ratings.user'],
      order: { createdAt: 'DESC' },
    });
    return notes.map((n) => {
      const userIsHelpful = (n.ratings ?? []).find((r) => r.user?.username === currentUsername)?.helpful ?? null;
      return {
        id: n.id,
        content: n.content,
        isVisible: n.isVisible,
        authorUsername: n.author!.username,
        helpfulCount: (n.ratings ?? []).filter((r) => r.helpful).length,
        notHelpfulCount: (n.ratings ?? []).filter((r) => !r.helpful).length,
        isHelpful: userIsHelpful === null ? null : userIsHelpful,
      };
    });
  }
}