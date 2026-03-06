import { Module } from '@nestjs/common';
import { GrokBotSeeder } from './grok-bot.seeder';
import { GrokService } from './grok.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [GrokBotSeeder, GrokService],
  exports: [GrokService],
})
export class GrokModule {}
