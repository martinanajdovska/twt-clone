import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { UsersService } from '../users/users.service';
import { TweetsService } from '../tweets/tweets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { Tweet } from '../entities/tweet.entity';
import { LikeResponseDto } from './dto/like-response.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TweetsService))
    private readonly tweetsService: TweetsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async save(username: string, tweetId: number): Promise<LikeResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const tweet = await this.tweetsService.findById(tweetId);
    if (!tweet) throw new NotFoundException('Tweet not found');

    const like = this.likeRepo.create({ user, tweet });
    const saved = await this.likeRepo.save(like);

    if (tweet.user!.username !== username) {
      await this.notificationsService.createNotification(
        tweet.user!.username,
        username,
        'liked your tweet',
        `/tweets/${tweetId}`,
        NotificationType.LIKE,
      );
    }

    const likeResponseDto: LikeResponseDto = {
      id: saved.id,
      username: user.username,
      tweetId,
      createdAt: saved.createdAt,
    };

    return likeResponseDto;
  }

  async countLikes(tweetId: number): Promise<number> {
    return this.likeRepo.count({ where: { tweet: { id: tweetId } } });
  }

  async delete(username: string, tweetId: number): Promise<void> {
    const like = await this.likeRepo.findOne({
      where: { tweet: { id: tweetId }, user: { username } },
      relations: ['user', 'tweet'],
    });
    if (!like) throw new NotFoundException('Like not found');

    await this.likeRepo.remove(like);
  }

  async existsByTweetIdAndUsername(
    tweetId: number,
    username: string,
  ): Promise<boolean> {
    return (
      (await this.likeRepo.count({
        where: { tweet: { id: tweetId }, user: { username } },
      })) > 0
    );
  }

  async findLikerUsernamesByTweetId(tweetId: number): Promise<string[]> {
    const tweet = await this.tweetsService.findById(tweetId);
    if (!tweet) throw new NotFoundException('Tweet not found');

    const likes = await this.likeRepo.find({
      where: { tweet: { id: tweetId } },
      relations: ['user'],
    });
    return likes.map((l) => l.user!.username);
  }

  async findLikedTweetsByUsername(
    username: string,
    page: number,
    size: number,
  ): Promise<Tweet[]> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const likes = await this.likeRepo.find({
      where: { user: { username } },
      relations: [
        'tweet',
        'tweet.user',
        'tweet.parentTweet',
        'tweet.quotedTweet',
        'tweet.quotedTweet.user',
      ],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });

    return likes.map((l) => l.tweet!).filter(Boolean);
  }
}
