import { Module, forwardRef } from '@nestjs/common';
import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TweetsModule } from 'src/tweets/tweets.module';
import { LikesModule } from 'src/likes/likes.module';
import { RetweetsModule } from 'src/retweets/retweets.module';
import { CommunityNotesService } from './community-notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityNotesController } from './community-notes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityNote, NoteRating]),
    UsersModule,
    NotificationsModule,
    forwardRef(() => TweetsModule),
    LikesModule,
    RetweetsModule,
  ],
  providers: [CommunityNotesService],
  exports: [CommunityNotesService],
  controllers: [CommunityNotesController],
})
export class CommunityNotesModule {}
