import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from '../entities/tweet.entity';
import { TweetsService } from './tweets.service';
import { FeedService } from './feed.service';
import { TweetsController } from './tweets.controller';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LikesModule } from '../likes/likes.module';
import { RetweetsModule } from '../retweets/retweets.module';
import { FollowsModule } from '../follows/follows.module';
import { GrokModule } from 'src/grok/grok.module';
import { CommunityNotesModule } from 'src/community-notes/community-notes.module';
import { BookmarksModule } from 'src/bookmarks/bookmarks.module';
import { PollsModule } from '../polls/polls.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet]),
    UsersModule,
    PollsModule,
    CloudinaryModule,
    NotificationsModule,
    forwardRef(() => LikesModule),
    forwardRef(() => RetweetsModule),
    FollowsModule,
    GrokModule,
    forwardRef(() => CommunityNotesModule),
    forwardRef(() => BookmarksModule),
  ],
  controllers: [TweetsController],
  providers: [TweetsService, FeedService],
  exports: [TweetsService, FeedService],
})
export class TweetsModule {}
