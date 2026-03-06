import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from '../entities/like.entity';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { UsersModule } from '../users/users.module';
import { TweetsModule } from '../tweets/tweets.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),
    UsersModule,
    forwardRef(() => TweetsModule),
    NotificationsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
