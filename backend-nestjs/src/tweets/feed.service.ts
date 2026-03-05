import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Tweet } from '../entities/tweet.entity';
import { TweetsService } from './tweets.service';
import { UsersService } from '../users/users.service';
import { FollowsService } from '../follows/follows.service';
import { LikesService } from '../likes/likes.service';
import { RetweetsService } from '../retweets/retweets.service';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { TweetResponseDto } from './dto/tweet-response.dto';

export interface UserResponseDto {
  username: string;
  tweets: TweetResponseDto[];
}

export interface TweetDetailsDto {
  tweet: TweetResponseDto;
  parentTweet: TweetResponseDto | null;
  replies: TweetResponseDto[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}

@Injectable()
export class FeedService {
  constructor(
    private tweetsService: TweetsService,
    private usersService: UsersService,
    private followsService: FollowsService,
    private likesService: LikesService,
    private retweetsService: RetweetsService,
    @Inject(forwardRef(() => BookmarksService))
    private bookmarksService: BookmarksService,
  ) {}

  async generateFeed(
    username: string,
    pageable: { page: number; size: number },
  ): Promise<Page<TweetResponseDto>> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    const followedUsernames = await this.followsService.getFollowingUsernames(username);
    const tweetsFromFollowed = await this.tweetsService.findAllParentTweetsByUsernames(
      followedUsernames,
    );
    const retweetsFromFollowed = await this.retweetsService.findRetweetsByUsernames(
      followedUsernames,
    );
    const feedItems: TweetResponseDto[] = [];
    for (const t of tweetsFromFollowed) {
      feedItems.push(await this.addTweetInfo(t, null, username));
    }
    for (const r of retweetsFromFollowed) {
      const t = await this.tweetsService.findById(r.tweet.id);
      if (t) {
        feedItems.push(
          await this.addTweetInfo(t, r.user.username, username),
        );
      }
    }
    feedItems.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const start = pageable.page * pageable.size;
    const end = Math.min(start + pageable.size, feedItems.length);
    const content =
      start < feedItems.length ? feedItems.slice(start, end) : [];
    return {
      content,
      totalElements: feedItems.length,
      size: pageable.size,
      number: pageable.page,
    };
  }

  async generateProfileFeed(
    username: string,
    pageable: { page: number; size: number },
    requesterUsername: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    const tweets = await this.tweetsService.findAllParentTweetsByUsername(username);
    const retweets = await this.retweetsService.findRetweetsByUsername(username);
    const combined: Tweet[] = [];
    for (const t of tweets) combined.push(t);
    for (const r of retweets) {
      const t = await this.tweetsService.findById(r.tweet.id);
      if (t) combined.push(t);
    }
    combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const pageItems = combined.slice(
      pageable.page * pageable.size,
      pageable.page * pageable.size + pageable.size,
    );
    const tweetDtos: TweetResponseDto[] = [];
    for (const t of pageItems) {
      tweetDtos.push(
        await this.addTweetInfo(t, username, requesterUsername),
      );
    }
    return {
      username,
      tweets: tweetDtos,
    };
  }

  async getTweetById(id: number, username: string): Promise<TweetResponseDto> {
    const tweet = await this.tweetsService.findById(id);
    if (!tweet) throw new NotFoundException('Tweet not found');
    return this.addTweetInfo(tweet, null, username);
  }

  async getTweetDetails(
    id: number,
    username: string,
    pageable: { page: number; size: number },
  ): Promise<TweetDetailsDto> {
    const tweetDto = await this.getTweetById(id, username);
    let parentTweetDto: TweetResponseDto | null = null;
    if (tweetDto.parentId != null) {
      parentTweetDto = await this.getTweetById(tweetDto.parentId, username);
    }
    const tweet = await this.tweetsService.findById(id);
    if (!tweet) throw new NotFoundException('Tweet not found');
    const replies = await this.tweetsService.findAllRepliesOfTweet(
      id,
      pageable.page,
      pageable.size,
    );
    const repliesDto: TweetResponseDto[] = [];
    for (const r of replies) {
      repliesDto.push(await this.addTweetInfo(r, null, username));
    }
    return {
      tweet: tweetDto,
      parentTweet: parentTweetDto,
      replies: repliesDto,
    };
  }

  public async addTweetInfo(
    tweet: Tweet,
    username: string | null,
    requesterUsername: string,
  ): Promise<TweetResponseDto> {
    const dto = this.tweetsService.toResponseDto(tweet, requesterUsername);
    dto.likesCount = await this.likesService.countLikes(tweet.id);
    dto.repliesCount = Array.isArray(tweet.replies) ? tweet.replies.length : 0;
    dto.retweetsCount = await this.retweetsService.countRetweets(tweet.id);
    dto.parentId = tweet.parentTweet?.id ?? null;
    dto.retweetedBy = tweet.user.username !== username ? username: null;
    dto.liked = await this.likesService.existsByTweetIdAndUsername(
      tweet.id,
      requesterUsername,
    );
    dto.retweeted = await this.retweetsService.existsByTweetIdAndUsername(
      tweet.id,
      requesterUsername,
    );
    dto.bookmarked = await this.bookmarksService.existsByTweetIdAndUsername(
      tweet.id,
      requesterUsername,
    );
    return dto;
  }
}
