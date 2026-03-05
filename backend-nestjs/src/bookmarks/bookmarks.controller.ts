import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

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
    @Param('tweetId', ParseIntPipe) tweetId: string,
    @CurrentUsername() username: string,
  ) {
    return this.bookmarksService.save(username, parseInt(tweetId, 10));
  }

  @Delete(':tweetId')
  async delete(
    @Param('tweetId', ParseIntPipe) tweetId: string,
    @CurrentUsername() username: string,
  ) {
    await this.bookmarksService.delete(username, parseInt(tweetId, 10));
  }
}
