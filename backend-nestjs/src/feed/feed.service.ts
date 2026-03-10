import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Tweet } from '../entities/tweet.entity';
import { TweetsService } from '../tweets/tweets.service';
import { UsersService } from '../users/users.service';
import { FollowsService } from '../follows/follows.service';
import { LikesService } from '../likes/likes.service';
import { RetweetsService } from '../retweets/retweets.service';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { PollsService } from '../polls/polls.service';
import { TweetResponseDto } from '../tweets/dto/tweet-response.dto';
import { TweetWithNotes } from '../tweets/type/tweet-with-notes.type';
import { TweetDetailsDto } from './dto/tweet-details.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RetweetDto } from 'src/retweets/dto/retweet.dto';

export interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}

@Injectable()
export class FeedService {
  constructor(
    private readonly tweetsService: TweetsService,
    private readonly usersService: UsersService,
    private readonly followsService: FollowsService,
    private readonly likesService: LikesService,
    private readonly retweetsService: RetweetsService,
    @Inject(forwardRef(() => BookmarksService))
    private readonly bookmarksService: BookmarksService,
    private readonly pollsService: PollsService,
  ) {}

  async generateFeed(
    username: string,
    pageable: { page: number; size: number },
  ): Promise<Page<TweetResponseDto>> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const followedUsernames =
      await this.followsService.getFollowingUsernames(username);
    const usernamesForFeed = [...new Set([...followedUsernames])];
    const tweets =
      await this.tweetsService.findAllParentTweetsByUsernames(usernamesForFeed);
    const retweets =
      await this.retweetsService.findRetweetsByUsernames(usernamesForFeed);

    const sorted = await this.toSortedDtos(tweets, retweets, username);
    const content = this.paginateItems(
      sorted.map((x) => x.dto),
      pageable.page,
      pageable.size,
    );

    return {
      content,
      totalElements: sorted.length,
      size: pageable.size,
      number: pageable.page,
    };
  }

  async generateProfileFeed(
    username: string,
    pageable: { page: number; size: number },
    requesterUsername: string,
    tab: 'tweets' | 'replies' | 'likes' | 'media',
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    if (tab === 'replies') {
      const replies = await this.tweetsService.findRepliesByUsername(
        username,
        pageable.page,
        pageable.size,
      );
      const tweetDtos: TweetResponseDto[] = [];

      for (const t of replies) {
        tweetDtos.push(await this.addTweetInfo(t, null, requesterUsername));
      }

      return { username, tweets: tweetDtos };
    }

    if (tab === 'likes') {
      const likedTweets = await this.likesService.findLikedTweetsByUsername(
        username,
        pageable.page,
        pageable.size,
      );
      const tweetDtos: TweetResponseDto[] = [];

      for (const t of likedTweets) {
        tweetDtos.push(await this.addTweetInfo(t, null, requesterUsername));
      }

      return { username, tweets: tweetDtos };
    }

    if (tab === 'media') {
      const tweets =
        await this.tweetsService.findAllParentTweetsByUsername(username);
      const retweets =
        await this.retweetsService.findRetweetsByUsername(username);

      const sorted = await this.toSortedDtos(
        tweets,
        retweets,
        requesterUsername,
        (t) => !!t.imageUrl,
      );
      const pageItems = this.paginateItems(
        sorted,
        pageable.page,
        pageable.size,
      ).map((x) => x.dto);
      return { username, tweets: pageItems };
    }

    const pinnedTweet =
      await this.tweetsService.findPinnedTweetByUsername(username);
    const pinnedId = pinnedTweet?.id ?? null;

    const tweets =
      await this.tweetsService.findAllParentTweetsByUsername(username);
    const retweets =
      await this.retweetsService.findRetweetsByUsername(username);

    const sorted = await this.toSortedDtos(
      tweets,
      retweets,
      requesterUsername,
      (t) => pinnedId == null || t.id !== pinnedId,
    );

    const tweetDtos: TweetResponseDto[] = [];

    if (pageable.page === 0 && pinnedTweet) {
      tweetDtos.push(
        await this.addTweetInfo(pinnedTweet, username, requesterUsername),
      );
      tweetDtos.push(
        ...this.paginateItems(sorted, 0, pageable.size - 1).map((x) => x.dto),
      );
    } else {
      const offset = pinnedTweet
        ? Math.max(0, pageable.page * pageable.size - 1)
        : pageable.page * pageable.size;
      tweetDtos.push(
        ...sorted.slice(offset, offset + pageable.size).map((x) => x.dto),
      );
    }

    return { username, tweets: tweetDtos };
  }

  async getTweetById(id: number, username: string): Promise<TweetResponseDto> {
    const tweet = await this.tweetsService.findById(id);
    if (!tweet) throw new NotFoundException('Tweet not found');

    return this.addTweetInfo(tweet, null, username);
  }

  async getTweetQuotes(
    tweetId: number,
    username: string,
    pageable: { page: number; size: number },
  ): Promise<Page<TweetResponseDto>> {
    const tweet = await this.tweetsService.findById(tweetId);
    if (!tweet) throw new NotFoundException('Tweet not found');

    const quotes = await this.tweetsService.findAllQuotesOfTweet(
      tweetId,
      pageable.page,
      pageable.size,
    );
    const totalElements = await this.tweetsService.countQuotes(tweetId);
    const content: TweetResponseDto[] = [];

    for (const t of quotes) {
      content.push(await this.addTweetInfo(t, null, username));
    }

    return {
      content,
      totalElements,
      size: pageable.size,
      number: pageable.page,
    };
  }

  async getTweetDetails(
    id: number,
    username: string,
    pageable: { page: number; size: number },
  ): Promise<TweetDetailsDto> {
    const tweet = await this.tweetsService.findById(id);
    if (!tweet) throw new NotFoundException('Tweet not found');

    const tweetDto = await this.getTweetById(id, username);
    let parentTweetDto: TweetResponseDto | null = null;

    if (tweetDto.parentId != null) {
      parentTweetDto = await this.getTweetById(tweetDto.parentId, username);
    }

    const replies = await this.tweetsService.findAllRepliesOfTweet(
      id,
      pageable.page,
      pageable.size,
    );
    const repliesDto: TweetResponseDto[] = [];

    for (const r of replies) {
      repliesDto.push(await this.addTweetInfo(r, null, username));
    }

    const tweetDetailsDto: TweetDetailsDto = {
      tweet: tweetDto,
      parentTweet: parentTweetDto,
      replies: repliesDto,
    };

    return tweetDetailsDto;
  }

  public async addTweetInfo(
    tweet: Tweet,
    username: string | null,
    requesterUsername: string,
  ): Promise<TweetResponseDto> {
    await this.tweetsService.addNotesWithRatings(tweet as TweetWithNotes);

    const dto = this.tweetsService.toResponseDto(
      tweet as TweetWithNotes,
      requesterUsername,
    );

    dto.likesCount = await this.likesService.countLikes(tweet.id);
    dto.repliesCount = await this.tweetsService.countReplies(tweet.id);
    dto.retweetsCount = await this.retweetsService.countRetweets(tweet.id);
    dto.quotesCount = await this.tweetsService.countQuotes(tweet.id);
    dto.bookmarksCount = await this.bookmarksService.countBookmarks(tweet.id);
    dto.parentId = tweet.parentTweet?.id ?? null;
    dto.retweetedBy = username ?? null;
    dto.isLiked = await this.likesService.existsByTweetIdAndUsername(
      tweet.id,
      requesterUsername,
    );
    dto.isRetweeted = await this.retweetsService.existsByTweetIdAndUsername(
      tweet.id,
      requesterUsername,
    );
    dto.isBookmarked = await this.bookmarksService.existsByTweetIdAndUsername(
      tweet.id,
      requesterUsername,
    );
    if (tweet.poll) {
      dto.poll = await this.pollsService.getPollDto(
        tweet.poll.id,
        requesterUsername,
      );
    }
    return dto;
  }

  private async toSortedDtos(
    tweets: TweetWithNotes[],
    retweets: RetweetDto[],
    requesterUsername: string,
    filter?: (t: Tweet) => boolean,
  ): Promise<{ dto: TweetResponseDto; sortDate: Date }[]> {
    const items: { dto: TweetResponseDto; sortDate: Date }[] = [];

    for (const t of tweets) {
      if (filter && !filter(t)) continue;
      const dto = await this.addTweetInfo(t, null, requesterUsername);
      items.push({ dto, sortDate: new Date(t.createdAt) });
    }

    for (const r of retweets) {
      const t = await this.tweetsService.findById(r.tweetId);
      if (!t) continue;
      if (filter && !filter(t)) continue;
      const dto = await this.addTweetInfo(
        t,
        r.retweetedByUsername,
        requesterUsername,
      );
      items.push({ dto, sortDate: new Date(r.createdAt) });
    }

    return items.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  }

  private paginateItems<T>(items: T[], page: number, size: number): T[] {
    const start = page * size;
    return items.slice(start, start + size);
  }
}
