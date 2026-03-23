import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  async findAll(
    @Query('page') page = '0',
    @Query('size') size = '5',
    @CurrentUsername() username: string,
  ) {
    const pageNum = Math.max(0, parseInt(page, 10));
    const sizeNum = Math.min(50, Math.max(1, parseInt(size, 10)));
    return this.bookmarksService.findByUsername(username, {
      page: pageNum,
      size: sizeNum,
    });
  }

  @Post(':tweetId')
  async save(
    @Param('tweetId', ParseIntPipe) tweetId: number,
    @CurrentUsername() username: string,
  ) {
    return this.bookmarksService.save(username, tweetId);
  }

  @Delete(':tweetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('tweetId', ParseIntPipe) tweetId: number,
    @CurrentUsername() username: string,
  ) {
    await this.bookmarksService.delete(username, tweetId);
  }
}
