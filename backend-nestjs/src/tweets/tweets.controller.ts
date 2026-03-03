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
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUsername() username: string,
  ) {
    const parent = parentId ? parseInt(parentId, 10) : null;
    return this.tweetsService.save(
      username,
      isNaN(parent as number) ? null : parent,
      content || '',
      file,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUsername() username: string,
  ) {
    await this.tweetsService.deleteById(parseInt(id, 10), username);
  }

  @Get(':id')
  async getTweet(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUsername() username: string,
  ) {
    return this.feedService.getTweetById(parseInt(id, 10), username);
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
