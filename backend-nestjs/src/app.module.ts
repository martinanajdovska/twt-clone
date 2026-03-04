import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TweetsModule } from './tweets/tweets.module';
import { LikesModule } from './likes/likes.module';
import { RetweetsModule } from './retweets/retweets.module';
import { FollowsModule } from './follows/follows.module';
import { ProfileModule } from './profile/profile.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

import { User } from './entities/user.entity';
import { Tweet } from './entities/tweet.entity';
import { Like } from './entities/like.entity';
import { Retweet } from './entities/retweet.entity';
import { Follow } from './entities/follow.entity';
import { Notification } from './entities/notification.entity';
import { GrokModule } from './grok/grok.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Tweet, Like, Retweet, Follow, Notification],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: { fileSize: 3 * 1024 * 1024 },
    }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    TweetsModule,
    LikesModule,
    RetweetsModule,
    FollowsModule,
    ProfileModule,
    NotificationsModule,
    CloudinaryModule,
    GrokModule,
  ],
})
export class AppModule {}
