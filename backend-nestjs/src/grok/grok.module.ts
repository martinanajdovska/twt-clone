import { Module } from '@nestjs/common';
import { GrokBotSeeder } from './grok-bot.seeder';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { GrokService } from './grok.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User]), NotificationsModule],
    providers: [GrokBotSeeder, GrokService],
    exports: [GrokService],
})
export class GrokModule {}
