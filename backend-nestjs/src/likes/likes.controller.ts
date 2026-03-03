import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUsername } from '../common/decorators/current-user.decorator';

@Controller('api/tweets')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post(':tweetId/likes')
  async save(
    @Param('tweetId', ParseIntPipe) tweetId: string,
    @CurrentUsername() username: string,
  ) {
    return this.likesService.save(username, parseInt(tweetId, 10));
  }

  @Get(':tweetId/likes')
  async count(@Param('tweetId', ParseIntPipe) tweetId: string) {
    return this.likesService.countLikes(parseInt(tweetId, 10));
  }

  @Delete(':tweetId/likes')
  async delete(
    @Param('tweetId', ParseIntPipe) tweetId: string,
    @CurrentUsername() username: string,
  ) {
    await this.likesService.delete(username, parseInt(tweetId, 10));
  }
}
