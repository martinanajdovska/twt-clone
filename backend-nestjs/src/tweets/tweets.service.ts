import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Tweet } from '../entities/tweet.entity';
import { Role } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TweetResponseDto } from './dto/tweet-response.dto';
import { GrokService } from 'src/grok/grok.service';
import { PollsService } from '../polls/polls.service';
import { CommunityNotesService } from '../community-notes/community-notes.service';
import { TweetWithNotes } from './type/tweet-with-notes.type';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepo: Repository<Tweet>,
    @Inject(forwardRef(() => CommunityNotesService))
    private readonly communityNotesService: CommunityNotesService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly grokService: GrokService,
    private readonly pollsService: PollsService,
  ) {}

  async save(
    username: string,
    parentId: number | null,
    quoteId: number | null,
    content?: string,
    file?: Express.Multer.File,
    pollOptions?: string[],
    pollDurationHours?: number,
  ): Promise<TweetResponseDto> {
    if (!content?.trim() && !file && !pollOptions) {
      throw new BadRequestException("Can't post empty tweet");
    }

    if (content && content.length > 280) {
      throw new BadRequestException('Tweet cannot exceed 280 characters');
    }

    let validOptions: string[] = [];
    if (pollOptions) {
      if (parentId != null)
        throw new BadRequestException('Polls are not allowed in replies');

      if (pollOptions.length < 2 || pollOptions.length > 4) {
        throw new BadRequestException('Poll must have 2 to 4 options');
      }

      validOptions = pollOptions.map((o) => (o || '').trim()).filter(Boolean);

      if (validOptions.length < 2) {
        throw new BadRequestException(
          'Poll must have at least 2 non-empty options',
        );
      }

      if (validOptions.some((o) => o.length > 25)) {
        throw new BadRequestException(
          'Each poll option must be 25 characters or less',
        );
      }

      const duration = pollDurationHours ?? 24;
      if (duration < 1 || duration > 168) {
        throw new BadRequestException(
          'Poll duration must be between 1 and 168 hours (7 days)',
        );
      }
    }

    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    let parentTweet: Tweet | null = null;
    let quotedTweet: Tweet | null = null;

    if (parentId != null) {
      parentTweet = await this.tweetRepo.findOne({
        where: { id: parentId },
        relations: ['user'],
      });
      if (!parentTweet) throw new NotFoundException('Parent tweet not found');
    }

    if (quoteId != null) {
      quotedTweet = await this.tweetRepo.findOne({
        where: { id: quoteId },
        relations: ['user'],
      });
      if (!quotedTweet) throw new NotFoundException('Quoted tweet not found');
    }

    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadFile(file, 'tweet_images');
    }

    const tweet = this.tweetRepo.create({
      user,
      parentTweet,
      quotedTweet,
      content: content!.trim(),
      imageUrl,
    });
    const saved = await this.tweetRepo.save(tweet);

    let createdPoll: { id: number } | null = null;

    if (pollOptions) {
      createdPoll = await this.pollsService.createPoll(
        saved.id,
        validOptions,
        pollDurationHours ?? 24,
      );
    }

    if (
      parentId != null &&
      parentTweet &&
      parentTweet.user.username !== username
    ) {
      await this.notificationsService.createNotification(
        parentTweet.user.username,
        username,
        'replied to your tweet',
        `/tweets/${saved.id}`,
        NotificationType.REPLY,
      );
    }

    if (content) {
      const mentionRegex = /@(\w+)/g;
      const mentionedUsernames = new Set<string>();
      let match: RegExpExecArray | null;

      while ((match = mentionRegex.exec(content)) !== null) {
        mentionedUsernames.add(match[1]);
      }

      mentionedUsernames.delete(username);

      for (const mentioned of mentionedUsernames) {
        const mentionedUser = await this.usersService.findByUsername(mentioned);

        if (mentionedUser) {
          await this.notificationsService.createNotification(
            mentionedUser.username,
            username,
            'mentioned you in a tweet',
            `/tweets/${saved.id}`,
            NotificationType.MENTION,
          );
        }
      }
    }
    if (
      (parentTweet && parentTweet.user.role === Role.GROK) ||
      (tweet.content && tweet.content.startsWith('@grok '))
    ) {
      const reply = await this.grokService.generateReply(tweet.content || '');

      if (reply && reply.trim() !== '') {
        const grok = await this.usersService.findByUsername('grok');
        if (!grok) throw new NotFoundException('Grok not found');

        const grokReply = this.tweetRepo.create({
          user: grok,
          parentTweet: saved,
          content: reply,
        });

        await this.tweetRepo.save(grokReply);
        await this.notificationsService.createNotification(
          saved.user.username,
          'grok',
          'replied to your tweet',
          `/tweets/${grokReply.id}`,
          NotificationType.REPLY,
        );
      }
    }

    const dto = this.toResponseDto(saved, username);
    if (createdPoll) {
      dto.poll = await this.pollsService.getPollDto(createdPoll.id, username);
    }

    return dto;
  }

  async findById(id: number): Promise<TweetWithNotes | null> {
    const tweet = await this.tweetRepo.findOne({
      where: { id },
      relations: [
        'user',
        'parentTweet',
        'quotedTweet',
        'quotedTweet.user',
        'poll',
      ],
    });
    if (!tweet) throw new NotFoundException('Tweet not found');

    await this.addNotesWithRatings(tweet);
    return tweet;
  }

  async findAllParentTweetsByUsername(
    username: string,
  ): Promise<TweetWithNotes[]> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const tweets = await this.tweetRepo.find({
      where: { user: { username }, parentTweet: IsNull() },
      relations: ['user', 'quotedTweet', 'quotedTweet.user', 'poll'],
      order: { createdAt: 'DESC' },
    });

    await this.addNotesWithRatings(tweets);
    return tweets;
  }

  async findRepliesByUsername(
    username: string,
    page: number,
    size: number,
  ): Promise<TweetWithNotes[]> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const tweets = await this.tweetRepo.find({
      where: { user: { username }, parentTweet: Not(IsNull()) },
      relations: [
        'user',
        'parentTweet',
        'quotedTweet',
        'quotedTweet.user',
        'poll',
      ],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });

    await this.addNotesWithRatings(tweets);
    return tweets;
  }

  async findAllParentTweetsByUsernames(
    usernames: string[],
  ): Promise<TweetWithNotes[]> {
    if (usernames.length === 0) return [];
    const tweets = await this.tweetRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.user', 'user')
      .leftJoinAndSelect('t.quotedTweet', 'quotedTweet')
      .leftJoinAndSelect('quotedTweet.user', 'quotedUser')
      .leftJoinAndSelect('t.poll', 'poll')
      .where('t.parent_id IS NULL')
      .andWhere('user.username IN (:...usernames)', { usernames })
      .orderBy('t.created_at', 'DESC')
      .getMany();
    await this.addNotesWithRatings(tweets);
    return tweets;
  }

  async countReplies(tweetId: number): Promise<number> {
    return this.tweetRepo
      .createQueryBuilder('tweet')
      .where('tweet.parent_id = :tweetId', { tweetId })
      .getCount();
  }

  async countQuotes(tweetId: number): Promise<number> {
    return this.tweetRepo
      .createQueryBuilder('tweet')
      .where('tweet.quoted_tweet_id = :tweetId', { tweetId })
      .getCount();
  }

  async findAllQuotesOfTweet(
    tweetId: number,
    page: number,
    size: number,
  ): Promise<TweetWithNotes[]> {
    const tweet = await this.tweetRepo.findOne({ where: { id: tweetId } });
    if (!tweet) throw new NotFoundException('Tweet not found');

    const tweets = await this.tweetRepo.find({
      where: { quotedTweet: { id: tweetId } },
      relations: ['user', 'quotedTweet', 'quotedTweet.user', 'poll'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    await this.addNotesWithRatings(tweets);
    return tweets;
  }

  async findAllRepliesOfTweet(
    tweetId: number,
    page: number,
    size: number,
  ): Promise<TweetWithNotes[]> {
    const tweet = await this.tweetRepo.findOne({ where: { id: tweetId } });
    if (!tweet) throw new NotFoundException('Tweet not found');

    const tweets = await this.tweetRepo.find({
      where: { parentTweet: { id: tweetId } },
      relations: ['user', 'quotedTweet', 'quotedTweet.user', 'poll'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    await this.addNotesWithRatings(tweets);
    return tweets;
  }

  async findReplyAuthorUsernamesByTweetId(tweetId: number): Promise<string[]> {
    const replies = await this.tweetRepo.find({
      where: { parentTweet: { id: tweetId } },
      relations: ['user'],
    });
    return replies.map((t) => t.user!.username);
  }

  async addNotesWithRatings(tweet: TweetWithNotes): Promise<void>;
  async addNotesWithRatings(tweets: TweetWithNotes[]): Promise<void>;
  async addNotesWithRatings(
    tweetOrTweets: TweetWithNotes | TweetWithNotes[],
  ): Promise<void> {
    if (Array.isArray(tweetOrTweets)) {
      if (tweetOrTweets.length === 0) return;

      const mostHelpfulByTweetId =
        await this.communityNotesService.getMostHelpfulNoteWithRating(
          tweetOrTweets.map((t) => t.id),
        );

      for (const t of tweetOrTweets) {
        const note = mostHelpfulByTweetId.get(t.id) ?? null;
        t.notes = note ? [note] : [];
      }
    } else {
      const note =
        await this.communityNotesService.getMostHelpfulNoteWithRating(
          tweetOrTweets.id,
        );
      tweetOrTweets.notes = note ? [note] : [];
    }
  }

  async deleteById(id: number, username: string): Promise<void> {
    const tweet = await this.tweetRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!tweet) throw new NotFoundException('Tweet not found');

    if (tweet.user.username !== username) {
      throw new BadRequestException('Not allowed to delete this tweet');
    }

    const quotingTweets = await this.tweetRepo
      .createQueryBuilder('tweet')
      .where('tweet.quoted_tweet_id = :id', { id })
      .getMany();

    for (const t of quotingTweets) {
      t.deletedQuotedTweetId = id;
      t.quotedTweet = null;
      await this.tweetRepo.save(t);
    }

    await this.tweetRepo.remove(tweet);
  }

  public toResponseDto(
    tweet: TweetWithNotes,
    currentUsername: string,
  ): TweetResponseDto {
    const created =
      tweet.createdAt instanceof Date
        ? tweet.createdAt.toISOString()
        : String(tweet.createdAt);

    let quoted: TweetResponseDto['quotedTweet'] = null;

    if (tweet.quotedTweet && tweet.quotedTweet.user) {
      quoted = {
        id: tweet.quotedTweet.id,
        username: tweet.quotedTweet.user.username,
        content: tweet.quotedTweet.content ?? '',
        imageUrl: tweet.quotedTweet.imageUrl ?? null,
        createdAt:
          tweet.quotedTweet.createdAt instanceof Date
            ? tweet.quotedTweet.createdAt.toISOString()
            : String(tweet.quotedTweet.createdAt),
        isDeleted: false,
      };
    } else if (tweet.deletedQuotedTweetId != null) {
      quoted = {
        id: tweet.deletedQuotedTweetId,
        username: '',
        content: 'This tweet was deleted',
        imageUrl: null,
        createdAt: '',
        isDeleted: true,
      };
    }

    const tweetWithNotes = tweet as TweetWithNotes;

    const visibleNotes = (tweetWithNotes.notes ?? []).filter(
      (n) => n.isVisible,
    );
    const sortedNotes = visibleNotes
      .map((n) => {
        const userIsHelpfulVote =
          (n.ratings ?? []).find((r) => r.user?.username === currentUsername)
            ?.isHelpful ?? null;
        return {
          id: n.id,
          content: n.content,
          helpfulCount: (n.ratings ?? []).filter((r) => r.isHelpful).length,
          isHelpful: userIsHelpfulVote === null ? null : userIsHelpfulVote,
        };
      })
      .sort((a, b) => b.helpfulCount - a.helpfulCount);

    const communityNote = sortedNotes.length > 0 ? sortedNotes[0] : null;

    const tweetResponseDto: TweetResponseDto = {
      id: tweet.id,
      username: tweet.user!.username,
      content: tweet.content ?? '',
      imageUrl: tweet.imageUrl ?? null,
      isPinned: tweet.pinnedAt != null,
      quotedTweet: quoted,
      poll: null,
      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      quotesCount: 0,
      bookmarksCount: 0,
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
      parentId: tweet.parentTweet?.id ?? null,
      retweetedBy: null,
      createdAt: created,
      profilePictureUrl: tweet.user!.imageUrl ?? null,
      communityNote,
    };

    return tweetResponseDto;
  }

  async findPinnedTweetByUsername(
    username: string,
  ): Promise<TweetWithNotes | null> {
    const tweet = await this.tweetRepo.findOne({
      where: {
        user: { username },
        pinnedAt: Not(IsNull()),
        parentTweet: IsNull(),
      },
      relations: [
        'user',
        'parentTweet',
        'quotedTweet',
        'quotedTweet.user',
        'poll',
      ],
    });
    if (!tweet) return null;
    await this.addNotesWithRatings(tweet);
    return tweet;
  }

  async pinTweetById(id: number, username: string): Promise<TweetResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    return this.tweetRepo.manager.transaction(async (manager) => {
      const tweet = await manager.findOne(Tweet, {
        where: { id },
        relations: [
          'user',
          'parentTweet',
          'quotedTweet',
          'quotedTweet.user',
          'poll',
        ],
      });

      if (!tweet) throw new NotFoundException('Tweet not found');
      await this.addNotesWithRatings(tweet as TweetWithNotes);

      if (tweet.user.username !== username) {
        throw new BadRequestException('Not allowed to pin this tweet');
      }

      if (tweet.parentTweet != null) {
        throw new BadRequestException('Only original tweets can be pinned');
      }

      await manager
        .createQueryBuilder()
        .update(Tweet)
        .set({ pinnedAt: null })
        .where('user_id = :userId', { userId: tweet.user.id })
        .andWhere('pinned_at IS NOT NULL')
        .andWhere('id != :id', { id })
        .execute();

      tweet.pinnedAt = new Date();
      const saved = await manager.save(Tweet, tweet);
      return this.toResponseDto(saved, username);
    });
  }

  async unpinTweetById(
    id: number,
    username: string,
  ): Promise<TweetResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const tweet = await this.tweetRepo.findOne({
      where: { id },
      relations: ['user', 'parentTweet', 'quotedTweet', 'quotedTweet.user'],
    });

    if (!tweet) throw new NotFoundException('Tweet not found');

    if (tweet.user.username !== username) {
      throw new BadRequestException('Not allowed to unpin this tweet');
    }

    tweet.pinnedAt = null;
    const saved = await this.tweetRepo.save(tweet);
    return this.toResponseDto(saved, username);
  }

  async votePoll(
    tweetId: number,
    optionId: number,
    username: string,
  ): Promise<TweetResponseDto['poll']> {
    return this.pollsService.vote(tweetId, optionId, username);
  }

  async searchByContent(q: string, username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const tweets = await this.tweetRepo
      .createQueryBuilder('tweet')
      .leftJoinAndSelect('tweet.user', 'user')
      .where('tweet.content ILIKE :q', { q: `%${q}%` })
      .orderBy('tweet.createdAt', 'DESC')
      .take(10)
      .getMany();
    await this.addNotesWithRatings(tweets as TweetWithNotes[]);
    return tweets.map((t) => this.toResponseDto(t as TweetWithNotes, username));
  }
}
