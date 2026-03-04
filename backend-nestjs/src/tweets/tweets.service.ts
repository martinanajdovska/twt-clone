import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tweet } from '../entities/tweet.entity';
import { Role } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TweetResponseDto } from './dto/tweet-response.dto';
import { GrokService } from 'src/grok/grok.service';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepo: Repository<Tweet>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private cloudinaryService: CloudinaryService,
    private grokService: GrokService,
  ) {}

  async save(
    username: string,
    parentId: number | null,
    content: string,
    file: Express.Multer.File | undefined,
  ): Promise<TweetResponseDto> {
    if (!content?.trim() && !file) {
      throw new BadRequestException("Can't post empty tweet");
    }
    if (content && content.length >= 255) {
      throw new BadRequestException("Can't post tweet longer than 255 characters");
    }
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    let parentTweet: Tweet | null = null;
    if (parentId != null) {
      parentTweet = await this.tweetRepo.findOne({
        where: { id: parentId },
        relations: ['user'],
      });
      if (!parentTweet) throw new NotFoundException('Parent tweet not found');
    }
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadFile(file, 'tweet_images');
    }
    const tweet = this.tweetRepo.create({
      user,
      parentTweet,
      content: content?.trim() || '',
      imageUrl,
    });
    const saved = await this.tweetRepo.save(tweet);
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
    if (parentTweet && parentTweet.user.role === Role.GROK || tweet.content && tweet.content.startsWith('@grok ')) {
        const reply = await this.grokService.generateReply(tweet.content || '');

        if (reply && reply.trim() !== '') {
          const grok = await this.usersService.findByUsername('grok');
          if (!grok) throw new NotFoundException('Grok not found');

          const replyTweet = this.tweetRepo.create({
            user: grok,
            parentTweet: saved,
            content: reply,
          });

          await this.tweetRepo.save(replyTweet);
          await this.notificationsService.createNotification(
            saved.user.username || '',
            'grok',
            'replied to your tweet',
            `/tweets/${replyTweet.id}`,
            NotificationType.REPLY,
          );
        }
      }
    return this.toResponseDto(saved);
  }

  async findById(id: number): Promise<Tweet | null> {
    return this.tweetRepo.findOne({
      where: { id },
      relations: ['user', 'parentTweet', 'replies', 'notes', 'notes.ratings'],
    });
  }

  async findAllParentTweetsByUsername(username: string): Promise<Tweet[]> {
    return this.tweetRepo.find({
      where: { user: { username }, parentTweet: IsNull() },
      relations: ['user', 'replies', 'notes', 'notes.ratings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllParentTweetsByUsernames(usernames: string[]): Promise<Tweet[]> {
    if (usernames.length === 0) return [];
    return this.tweetRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.user', 'user')
      .leftJoinAndSelect('t.replies', 'replies')
      .leftJoinAndSelect('t.notes', 'notes')
      .leftJoinAndSelect('notes.ratings', 'ratings')
      .where('t.parent_id IS NULL')
      .andWhere('user.username IN (:...usernames)', { usernames })
      .orderBy('t.created_at', 'DESC')
      .getMany();
  }

  async findAllRepliesOfTweet(
    tweetId: number,
    page: number,
    size: number,
  ): Promise<Tweet[]> {
    const tweet = await this.tweetRepo.findOne({ where: { id: tweetId } });
    if (!tweet) throw new NotFoundException('Tweet not found');
    return this.tweetRepo.find({
      where: { parentTweet: { id: tweetId } },
      relations: ['user', 'notes', 'notes.ratings'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
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
    await this.tweetRepo.remove(tweet);
  }

  toResponseDto(tweet: Tweet): TweetResponseDto {
    const created =
      tweet.createdAt instanceof Date
        ? tweet.createdAt.toISOString().slice(0, 10)
        : String(tweet.createdAt).slice(0, 10);

    const sortedNotes = (tweet.notes ?? [])
        .filter(n => n.isVisible)
        .map(n => ({
          id: n.id,
          content: n.content,
          helpfulCount: (n.ratings ?? []).filter(r => r.helpful).length,
        }))
        .sort((a, b) => b.helpfulCount - a.helpfulCount);

    const communityNote = sortedNotes.length > 0 ? sortedNotes[0] : null;

    return {
      id: tweet.id,
      username: tweet.user?.username ?? '',
      content: tweet.content ?? '',
      imageUrl: tweet.imageUrl ?? null,
      likesCount: 0,
      repliesCount: Array.isArray(tweet.replies) ? tweet.replies.length : 0,
      retweetsCount: 0,
      liked: false,
      retweeted: false,
      parentId: tweet.parentTweet?.id ?? null,
      retweetedBy: null,
      createdAt: created,
      profilePictureUrl: tweet.user?.imageUrl ?? null,
      communityNote,
    };
  }
}
