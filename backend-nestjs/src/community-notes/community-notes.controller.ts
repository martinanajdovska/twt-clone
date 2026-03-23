import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommunityNotesService } from './community-notes.service';
import { CurrentUsername } from 'src/common/decorators/current-user.decorator';

@Controller('api/community-notes')
@UseGuards(JwtAuthGuard)
export class CommunityNotesController {
  constructor(private readonly communityNotesService: CommunityNotesService) {}

  @Post('tweet/:tweetId')
  submitNote(
    @Param('tweetId', ParseIntPipe) tweetId: number,
    @Body('content') content: string,
    @CurrentUsername() username: string,
  ) {
    return this.communityNotesService.submitNote(tweetId, username, content);
  }

  @Get('tweet/:tweetId')
  getNotesForTweet(@Param('tweetId', ParseIntPipe) tweetId: number) {
    return this.communityNotesService.getMostHelpfulNoteWithRating(tweetId);
  }

  @Get('tweet/:tweetId/all')
  getAllNotesForTweet(
    @Param('tweetId', ParseIntPipe) tweetId: number,
    @CurrentUsername() username: string,
  ) {
    return this.communityNotesService.getAllNotesForTweetDto(tweetId, username);
  }

  @Post(':noteId/rate')
  rateNote(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body('helpful') isHelpful: boolean,
    @CurrentUsername() username: string,
  ) {
    return this.communityNotesService.rateNote(noteId, username, isHelpful);
  }
}
