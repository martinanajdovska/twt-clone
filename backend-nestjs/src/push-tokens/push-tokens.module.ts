import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { PushTokensController } from './push-tokens.controller';

@Module({
  imports: [UsersModule],
  controllers: [PushTokensController],
})
export class PushTokensModule {}

