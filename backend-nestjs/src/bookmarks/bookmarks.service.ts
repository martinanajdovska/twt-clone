import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from '../entities/bookmark.entity';
import { UsersService } from '../users/users.service';
import { TweetsService } from '../tweets/tweets.service';
import { TweetResponseDto } from '../tweets/dto/tweet-response.dto';
import { FeedService } from '../feed/feed.service';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepo: Repository<Bookmark>,
    private readonly usersService: UsersService,
    private readonly tweetsService: TweetsService,
    @Inject(forwardRef(() => FeedService))
    private readonly feedService: FeedService,
  ) {}

  async save(
    username: string,
    tweetId: number,
  ): Promise<{ id: number; tweetId: number; createdAt: Date }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const tweet = await this.tweetsService.findById(tweetId);
    if (!tweet) throw new NotFoundException('Tweet not found');

    const bookmark = this.bookmarkRepo.create({ user, tweet });
    const saved = await this.bookmarkRepo.save(bookmark);
    return {
      id: saved.id,
      tweetId,
      createdAt: saved.createdAt,
    };
  }

  async delete(username: string, tweetId: number): Promise<void> {
    const bookmark = await this.bookmarkRepo.findOne({
      where: { tweet: { id: tweetId }, user: { username } },
      relations: ['user', 'tweet'],
    });

    if (!bookmark) throw new NotFoundException('Bookmark not found');
    await this.bookmarkRepo.remove(bookmark);
  }

  async countBookmarks(tweetId: number): Promise<number> {
    return this.bookmarkRepo.count({
      where: { tweet: { id: tweetId } },
    });
  }

  async existsByTweetIdAndUsername(
    tweetId: number,
    username: string,
  ): Promise<boolean> {
    return (
      (await this.bookmarkRepo.count({
        where: { tweet: { id: tweetId }, user: { username } },
      })) > 0
    );
  }

  async findByUsername(
    username: string,
    pageable: { page: number; size: number },
  ): Promise<{
    content: TweetResponseDto[];
    totalElements: number;
    size: number;
    number: number;
  }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const [bookmarks, total] = await this.bookmarkRepo.findAndCount({
      where: { user: { username } },
      relations: [
        'tweet',
        'tweet.user',
        'tweet.parentTweet',
        'tweet.quotedTweet',
        'tweet.quotedTweet.user',
      ],
      order: { createdAt: 'DESC' },
      skip: pageable.page * pageable.size,
      take: pageable.size,
    });

    const content: TweetResponseDto[] = [];

    for (const b of bookmarks) {
      if (b.tweet) {
        content.push(
          await this.feedService.addTweetInfo(b.tweet, null, username),
        );
      }
    }

    return {
      content,
      totalElements: total,
      size: pageable.size,
      number: pageable.page,
    };
  }
}
