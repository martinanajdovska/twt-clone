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
  UploadedFiles,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TweetsService } from './tweets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/tweets')
@UseGuards(JwtAuthGuard)
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async save(
    @CurrentUsername() username: string,
    @Body('content') content: string,
    @Body('parentId', new ParseIntPipe({ optional: true }))
    parentId?: number,
    @Body('quoteId', new ParseIntPipe({ optional: true }))
    quoteId?: number,
    @Body('pollOptions') pollOptions?: string,
    @Body('pollDurationMinutes', new ParseIntPipe({ optional: true }))
    pollDurationMinutes?: number,
    @Body('gifUrl') gifUrl?: string,
    @UploadedFiles()
    files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const videoFile = files?.video?.[0];
    return this.tweetsService.save(
      username,
      content,
      parentId,
      quoteId,
      imageFile,
      videoFile,
      gifUrl,
      pollOptions,
      pollDurationMinutes,
    );
  }

  @Post(':id/poll/vote')
  async votePoll(
    @Param('id', ParseIntPipe) id: number,
    @Body('optionId', ParseIntPipe) optionId: number,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.votePoll(id, optionId, username);
  }

  @Get('search/content')
  async searchTweets(
    @Query('q') q: string,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.searchByContent(q, username);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    await this.tweetsService.deleteById(id, username);
  }

  @Post(':id/pin')
  async pinTweet(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.pinTweetById(id, username);
  }

  @Delete(':id/pin')
  async unpinTweet(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUsername() username: string,
  ) {
    return this.tweetsService.unpinTweetById(id, username);
  }
}
