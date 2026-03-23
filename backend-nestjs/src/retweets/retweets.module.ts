import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retweet } from '../entities/retweet.entity';
import { RetweetsService } from './retweets.service';
import { RetweetsController } from './retweets.controller';
import { UsersModule } from '../users/users.module';
import { TweetsModule } from '../tweets/tweets.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Retweet]),
    forwardRef(() => UsersModule),
    forwardRef(() => TweetsModule),
    NotificationsModule,
  ],
  controllers: [RetweetsController],
  providers: [RetweetsService],
  exports: [RetweetsService],
})
export class RetweetsModule {}
