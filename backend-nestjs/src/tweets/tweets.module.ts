import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from '../entities/tweet.entity';
import { TweetsService } from './tweets.service';
import { TweetsController } from './tweets.controller';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GrokModule } from 'src/grok/grok.module';
import { CommunityNotesModule } from 'src/community-notes/community-notes.module';
import { PollsModule } from '../polls/polls.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet]),
    forwardRef(() => UsersModule),
    PollsModule,
    CloudinaryModule,
    NotificationsModule,
    GrokModule,
    forwardRef(() => CommunityNotesModule),
  ],
  controllers: [TweetsController],
  providers: [TweetsService],
  exports: [TweetsService],
})
export class TweetsModule {}
