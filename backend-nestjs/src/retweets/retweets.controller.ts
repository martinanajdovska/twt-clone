import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RetweetsService } from './retweets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/tweets')
@UseGuards(JwtAuthGuard)
export class RetweetsController {
  constructor(private retweetsService: RetweetsService) {}

  @Post(':tweetId/retweets')
  async save(
    @Param('tweetId', ParseIntPipe) tweetId: string,
    @CurrentUsername() username: string,
  ) {
    return this.retweetsService.save(parseInt(tweetId, 10), username);
  }

  @Get(':tweetId/retweets')
  async count(@Param('tweetId', ParseIntPipe) tweetId: string) {
    return this.retweetsService.countRetweets(parseInt(tweetId, 10));
  }

  @Delete(':tweetId/retweets')
  async delete(
    @Param('tweetId', ParseIntPipe) tweetId: string,
    @CurrentUsername() username: string,
  ) {
    await this.retweetsService.delete(username, parseInt(tweetId, 10));
  }
}
