import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Patch('users/me/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @CurrentUsername() username: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    await this.usersService.updateProfileImage(username, file);
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
    await this.usersService.updateProfile(
      username,
      { bio, location, website, birthday, displayName },
      banner,
    );
  }
}
