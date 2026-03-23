import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';
import { FeedService } from '../feed/feed.service';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly feedService: FeedService,
  ) {}

  @Get('users')
  async getSearchResults(
    @Query('search') search: string,
    @CurrentUsername() _username: string,
  ) {
    return this.usersService.findByUsernameContaining(search || '');
  }

  @Get('users/me/info')
  async getMeInfo(@CurrentUsername() username: string) {
    return this.usersService.getUsernameAndProfilePicture(username);
  }

  @Get('users/:username')
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

  @Get('users/:username/info')
  async getProfileHeader(
    @Param('username') username: string,
    @CurrentUsername() currentUsername: string,
  ) {
    return this.usersService.getUserInfo(username, currentUsername);
  }

  @Patch('users/me/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @CurrentUsername() username: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateProfileImage(username, file);
  }

  @Patch('users/me/profile')
  @UseInterceptors(FileInterceptor('banner'))
  async updateProfile(
    @CurrentUsername() username: string,
    @Body('bio') bio?: string,
    @Body('location') location?: string,
    @Body('website') website?: string,
    @Body('birthday') birthday?: string,
    @Body('displayName') displayName?: string,
    @UploadedFile() banner?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(
      username,
      bio,
      location,
      website,
      birthday,
      displayName,
      banner,
    );
  }
}
