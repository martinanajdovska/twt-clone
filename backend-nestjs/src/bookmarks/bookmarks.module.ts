import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from '../entities/bookmark.entity';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { UsersModule } from '../users/users.module';
import { TweetsModule } from '../tweets/tweets.module';
import { FeedModule } from '../feed/feed.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark]),
    UsersModule,
    TweetsModule,
    forwardRef(() => FeedModule),
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
