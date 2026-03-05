import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommunityNotesService } from './community-notes.service';
import { CurrentUsername } from 'src/common/decorators/current-user.decorator';

@Controller('api/community-notes')
export class CommunityNotesController {
  constructor(private communityNotesService: CommunityNotesService) {}

  @Post('tweet/:tweetId')
  @UseGuards(JwtAuthGuard)
  submitNote(@Param('tweetId', ParseIntPipe) tweetId: string, @Body('content') content: string, @CurrentUsername() username: string) {
    return this.communityNotesService.submitNote(parseInt(tweetId, 10), username, content);
  }

  @Post(':noteId/rate')
  @UseGuards(JwtAuthGuard)
  rateNote(@Param('noteId', ParseIntPipe) noteId: string, @Body('helpful') helpful: boolean, @CurrentUsername() username: string) {
    return this.communityNotesService.rateNote(parseInt(noteId, 10), username, helpful);
  }

  @Get('tweet/:tweetId')
  getNotesForTweet(@Param('tweetId', ParseIntPipe) tweetId: string) {
    return this.communityNotesService.getNotesForTweet(parseInt(tweetId, 10));
  }

  @Get('tweet/:tweetId/all')
  @UseGuards(JwtAuthGuard)
  getAllNotesForTweet(@Param('tweetId', ParseIntPipe) tweetId: string, @CurrentUsername() username: string) {
    return this.communityNotesService.getAllNotesForTweet(parseInt(tweetId, 10), username);
  }
}