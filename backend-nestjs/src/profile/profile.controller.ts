import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FeedService } from '../tweets/feed.service';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private feedService: FeedService,
    private profileService: ProfileService,
  ) {}

  @Get(':username')
  async getProfileFeed(
    @Param('username') username: string,
    @Query('page') page = '0',
    @Query('size') size = '5',
    @Query('tab') tab: 'tweets' | 'replies' | 'likes' | 'media',
    @CurrentUsername() currentUsername: string,
  ) {
    const pageNum = Math.max(0, parseInt(page, 10));
    const sizeNum = Math.min(50, Math.max(1, parseInt(size, 10)));
    const tabValue =
      tab === 'replies' || tab === 'likes' || tab === 'media' ? tab : 'tweets';
    return this.feedService.generateProfileFeed(
      username,
      { page: pageNum, size: sizeNum },
      currentUsername,
      tabValue,
    );
  }

  @Get(':username/info')
  async getProfileHeader(
    @Param('username') username: string,
    @CurrentUsername() currentUsername: string,
  ) {
    return this.profileService.getUserInfo(username, currentUsername);
  }
}
