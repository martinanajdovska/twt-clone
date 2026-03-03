import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';

export interface FollowResponseDto {
  id: number;
  followerUsername: string;
  followedUsername: string;
  createdAt: Date;
}

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async save(followerUsername: string, followedUsername: string): Promise<FollowResponseDto> {
    const follower = await this.usersService.findByUsername(followerUsername);
    const followed = await this.usersService.findByUsername(followedUsername);
    if (!follower || !followed) throw new NotFoundException('User not found');
    const follow = this.followRepo.create({ follower, followed });
    const saved = await this.followRepo.save(follow);
    await this.notificationsService.createNotification(
      followedUsername,
      followerUsername,
      'followed you!',
      `/users/${followerUsername}`,
      NotificationType.FOLLOW,
    );
    return {
      id: saved.id,
      followerUsername: follower.username,
      followedUsername: followed.username,
      createdAt: saved.createdAt,
    };
  }

  async delete(followerUsername: string, followedUsername: string): Promise<void> {
    const follow = await this.followRepo.findOne({
      where: {
        follower: { username: followerUsername },
        followed: { username: followedUsername },
      },
      relations: ['follower', 'followed'],
    });
    if (!follow) throw new NotFoundException('Follow relation not found');
    await this.followRepo.remove(follow);
  }

  async getFollowingUsernames(username: string): Promise<string[]> {
    const list = await this.followRepo.find({
      where: { follower: { username } },
      relations: ['followed'],
    });
    return list.map((f) => f.followed.username);
  }

  async getFollowersUsernames(username: string): Promise<string[]> {
    const list = await this.followRepo.find({
      where: { followed: { username } },
      relations: ['follower'],
    });
    return list.map((f) => f.follower.username);
  }

  async getFollowerCount(username: string): Promise<number> {
    return this.followRepo.count({ where: { followed: { username } } });
  }

  async getFollowingCount(username: string): Promise<number> {
    return this.followRepo.count({ where: { follower: { username } } });
  }

  async existsFollowed(follower: string, followed: string): Promise<boolean> {
    return (
      (await this.followRepo.count({
        where: {
          follower: { username: follower },
          followed: { username: followed },
        },
      })) > 0
    );
  }

  async existsFollowingYou(followed: string, follower: string): Promise<boolean> {
    return (
      (await this.followRepo.count({
        where: {
          follower: { username: follower },
          followed: { username: followed },
        },
      })) > 0
    );
  }
}
