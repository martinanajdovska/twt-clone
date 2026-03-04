import { Module } from '@nestjs/common';
import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';
import { UsersModule } from 'src/users/users.module';
import { CommunityNotesService } from './community-notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityNotesController } from './community-notes.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CommunityNote, NoteRating]), UsersModule],
    providers: [CommunityNotesService],
    exports: [CommunityNotesService],
    controllers: [CommunityNotesController],
})
export class CommunityNotesModule {}
