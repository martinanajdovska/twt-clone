import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/tweets')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async generateFeed(
    @Query('page') page = '0',
    @Query('size') size = '5',
    @CurrentUsername() username: string,
  ) {
    const pageNum = Math.max(0, parseInt(page, 10));
    const sizeNum = Math.min(50, Math.max(1, parseInt(size, 10)));
    return this.feedService.generateFeed(username, {
      page: pageNum,
      size: sizeNum,
    });
  }

  @Get('videos')
  @UseGuards(JwtAuthGuard)
  async getVideoTweets(
    @Query('page') page = '0',
    @Query('size') size = '5',
    @CurrentUsername() username: string,
  ) {
    return this.feedService.getVideoTweetsForReels(
      username,
      parseInt(page, 10),
      parseInt(size, 10),
    );
  }

  @Get(':id')
  async getTweet(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    return this.feedService.getTweetById(id, username);
  }

  @Get(':id/quotes')
  @UseGuards(JwtAuthGuard)
  async getQuotes(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = '0',
    @Query('size') size = '20',
    @CurrentUsername() username: string,
  ) {
    const pageNum = Math.max(0, parseInt(page, 10));
    const sizeNum = Math.min(50, Math.max(1, parseInt(size, 10)));
    return this.feedService.getTweetQuotes(id, username, {
      page: pageNum,
      size: sizeNum,
    });
  }

  @Get(':id/details')
  async getDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = '0',
    @Query('size') size = '10',
    @CurrentUsername() username: string,
  ) {
    const pageNum = Math.max(0, parseInt(page, 10));
    const sizeNum = Math.min(50, Math.max(1, parseInt(size, 10)));
    return this.feedService.getTweetDetails(id, username, {
      page: pageNum,
      size: sizeNum,
    });
  }
}
