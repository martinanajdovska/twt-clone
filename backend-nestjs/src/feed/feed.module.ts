import { Module, forwardRef } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { TweetsModule } from '../tweets/tweets.module';
import { UsersModule } from '../users/users.module';
import { FollowsModule } from '../follows/follows.module';
import { LikesModule } from '../likes/likes.module';
import { RetweetsModule } from '../retweets/retweets.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { PollsModule } from '../polls/polls.module';

@Module({
  imports: [
    TweetsModule,
    UsersModule,
    FollowsModule,
    LikesModule,
    RetweetsModule,
    forwardRef(() => BookmarksModule),
    PollsModule,
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
