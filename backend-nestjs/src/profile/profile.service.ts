import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FollowsService } from '../follows/follows.service';

export interface UserInfoDto {
  username: string;
  followers: number;
  following: number;
  followed: boolean;
  followsYou: boolean;
  imageUrl: string | null;
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
    return {
      username: user.username,
      followers: await this.followsService.getFollowerCount(username),
      following: await this.followsService.getFollowingCount(username),
      followed: await this.followsService.existsFollowed(requester, username),
      followsYou: await this.followsService.existsFollowingYou(username, requester),
      imageUrl: user.imageUrl ?? null,
    };
  }
}
