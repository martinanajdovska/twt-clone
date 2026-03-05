import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FollowsService } from '../follows/follows.service';

export interface UserInfoDto {
  username: string;
  displayName: string | null;
  followers: number;
  following: number;
  followed: boolean;
  followsYou: boolean;
  imageUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  birthday: string | null;
  createdAt: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private usersService: UsersService,
    private followsService: FollowsService,
  ) {}

  async getUserInfo(username: string, requester: string): Promise<UserInfoDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    const createdAt =
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : String(user.createdAt ?? new Date());
    return {
      username: user.username,
      displayName: user.displayName ?? null,
      followers: await this.followsService.getFollowerCount(username),
      following: await this.followsService.getFollowingCount(username),
      followed: await this.followsService.existsFollowed(requester, username),
      followsYou: await this.followsService.existsFollowingYou(username, requester),
      imageUrl: user.imageUrl ?? null,
      bannerUrl: user.bannerUrl ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      website: user.website ?? null,
      birthday: user.birthday ?? null,
      createdAt,
    };
  }
}
