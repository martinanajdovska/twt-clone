import { Module, forwardRef } from '@nestjs/common';
import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TweetsModule } from '../tweets/tweets.module';
import { LikesModule } from 'src/likes/likes.module';
import { RetweetsModule } from 'src/retweets/retweets.module';
import { CommunityNotesService } from './community-notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityNotesController } from './community-notes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityNote, NoteRating]),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => TweetsModule),
    LikesModule,
    RetweetsModule,
  ],
  providers: [CommunityNotesService],
  exports: [CommunityNotesService],
  controllers: [CommunityNotesController],
})
export class CommunityNotesModule {}
