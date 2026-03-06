import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retweet } from '../entities/retweet.entity';
import { Tweet } from '../entities/tweet.entity';
import { UsersService } from '../users/users.service';
import { TweetsService } from '../tweets/tweets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class RetweetsService {
  constructor(
    @InjectRepository(Retweet)
    private readonly retweetRepo: Repository<Retweet>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TweetsService))
    private readonly tweetsService: TweetsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async save(
    tweetId: number,
    username: string,
  ): Promise<{
    id: number;
    username: string;
    tweetId: number;
    createdAt: Date;
  }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const tweet = await this.tweetsService.findById(tweetId);
    if (!tweet) throw new NotFoundException('Tweet not found');

    const retweet = this.retweetRepo.create({ user, tweet });
    const saved = await this.retweetRepo.save(retweet);

    if (tweet.user!.username !== username) {
      await this.notificationsService.createNotification(
        tweet.user!.username,
        username,
        'retweeted your tweet',
        `/tweets/${tweetId}`,
        NotificationType.RETWEET,
      );
    }

    return {
      id: saved.id,
      username: user.username,
      tweetId,
      createdAt: saved.createdAt,
    };
  }

  async countRetweets(tweetId: number): Promise<number> {
    return this.retweetRepo.count({ where: { tweet: { id: tweetId } } });
  }

  async delete(username: string, tweetId: number): Promise<void> {
    const retweet = await this.retweetRepo.findOne({
      where: { tweet: { id: tweetId }, user: { username } },
      relations: ['user', 'tweet'],
    });
    if (!retweet) throw new NotFoundException('Retweet not found');

    await this.retweetRepo.remove(retweet);
  }

  async existsByTweetIdAndUsername(
    tweetId: number,
    username: string,
  ): Promise<boolean> {
    return (
      (await this.retweetRepo.count({
        where: { tweet: { id: tweetId }, user: { username } },
      })) > 0
    );
  }

  async findRetweetsByUsername(username: string): Promise<{ tweet: Tweet }[]> {
    const list = await this.retweetRepo.find({
      where: { user: { username } },
      relations: ['tweet', 'tweet.user'],
    });
    return list.map((r) => ({ tweet: r.tweet }));
  }

  async findRetweetsByUsernames(
    usernames: string[],
  ): Promise<{ user: { username: string }; tweet: Tweet }[]> {
    if (usernames.length === 0) return [];

    const list = await this.retweetRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'u')
      .leftJoinAndSelect('r.tweet', 't')
      .leftJoinAndSelect('t.user', 'tu')
      .where('u.username IN (:...usernames)', { usernames })
      .orderBy('r.created_at', 'DESC')
      .getMany();
    return list;
  }

  async findRetweeterUsernamesByTweetId(tweetId: number): Promise<string[]> {
    const retweets = await this.retweetRepo.find({
      where: { tweet: { id: tweetId } },
      relations: ['user'],
    });
    return retweets.map((r) => r.user!.username);
  }
}
