import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TweetsModule } from '../tweets/tweets.module';
import { FollowsModule } from '../follows/follows.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TweetsModule, FollowsModule, UsersModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
