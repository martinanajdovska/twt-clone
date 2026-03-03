import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Get('follows/:username')
  async getFollowing(@Param('username') username: string) {
    return this.followsService.getFollowingUsernames(username);
  }

  @Post('follows/:username')
  async follow(
    @Param('username') followedUsername: string,
    @CurrentUsername() followerUsername: string,
  ) {
    return this.followsService.save(followerUsername, followedUsername);
  }

  @Delete('follows/:username')
  async unfollow(
    @Param('username') followedUsername: string,
    @CurrentUsername() followerUsername: string,
  ) {
    await this.followsService.delete(followerUsername, followedUsername);
  }

  @Get('followers/:username')
  async getFollowers(@Param('username') username: string) {
    return this.followsService.getFollowersUsernames(username);
  }
}
