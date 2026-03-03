import {
  Controller,
  Get,
  Patch,
  Query,
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
  constructor(private usersService: UsersService) {}

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
}
