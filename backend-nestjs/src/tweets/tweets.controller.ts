import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TweetsService } from './tweets.service';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/tweets')
@UseGuards(JwtAuthGuard)
export class TweetsController {
  constructor(
    private tweetsService: TweetsService,
    private feedService: FeedService,
  ) {}

  @Get()
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

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async save(
    @Body('content') content: string,
    @Body('parentId') parentId: string | undefined,
    @Body('quoteId') quoteId: string | undefined,
    @Body('pollOptions') pollOptionsRaw: string | undefined,
    @Body('pollDurationHours') pollDurationHoursStr: string | undefined,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUsername() username: string,
  ) {
    const parent = parentId ? parseInt(parentId, 10) : null;
    const quote = quoteId ? parseInt(quoteId, 10) : null;
    let pollOptions: string[] | undefined;

    if (pollOptionsRaw) {
      try {
        const parsed = JSON.parse(pollOptionsRaw) as unknown;
        pollOptions = Array.isArray(parsed)
          ? parsed.filter((x): x is string => typeof x === 'string')
          : undefined;
      } catch {
        pollOptions = undefined;
      }
    }

    const pollDurationHours = pollDurationHoursStr
      ? parseInt(pollDurationHoursStr, 10)
      : undefined;

    return this.tweetsService.save(
      username,
      isNaN(parent as number) ? null : parent,
      isNaN(quote as number) ? null : quote,
      content || '',
      file,
      pollOptions,
      pollDurationHours,
    );
  }

  @Post(':id/poll/vote')
  async votePoll(
    @Param('id', ParseIntPipe) id: string,
    @Body('optionId') optionId: number,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.votePoll(parseInt(id, 10), optionId, username);
  }

  @Get('search')
  async searchTweets(
    @Query('q') q: string,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.searchByContent(q, username);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUsername() username: string,
  ) {
    await this.tweetsService.deleteById(parseInt(id, 10), username);
  }

  @Post(':id/pin')
  async pinTweet(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.pinTweetById(parseInt(id, 10), username);
  }

  @Delete(':id/pin')
  async unpinTweet(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.unpinTweetById(parseInt(id, 10), username);
  }

  @Get(':id')
  async getTweet(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUsername() username: string,
  ) {
    return this.feedService.getTweetById(parseInt(id, 10), username);
  }

  @Get(':id/quotes')
  async getQuotes(
    @Param('id', ParseIntPipe) id: string,
    @Query('page') page = '0',
    @Query('size') size = '20',
    @CurrentUsername() username: string,
  ) {
    const pageNum = Math.max(0, parseInt(page, 10));
    const sizeNum = Math.min(50, Math.max(1, parseInt(size, 10)));
    return this.feedService.getTweetQuotes(parseInt(id, 10), username, {
      page: pageNum,
      size: sizeNum,
    });
  }

  @Get(':id/details')
  async getDetails(
    @Param('id', ParseIntPipe) id: string,
    @Query('page') page = '0',
    @Query('size') size = '5',
    @CurrentUsername() username: string,
  ) {
    const pageNum = Math.max(0, parseInt(page, 10));
    const sizeNum = Math.min(50, Math.max(1, parseInt(size, 10)));
    return this.feedService.getTweetDetails(parseInt(id, 10), username, {
      page: pageNum,
      size: sizeNum,
    });
  }
}
