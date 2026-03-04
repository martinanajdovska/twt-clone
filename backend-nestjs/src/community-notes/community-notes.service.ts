import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class CommunityNotesService {
  private readonly HELPFUL_THRESHOLD = 2; 

  constructor(
    @InjectRepository(CommunityNote) private noteRepo: Repository<CommunityNote>,
    @InjectRepository(NoteRating) private ratingRepo: Repository<NoteRating>,
    private usersService: UsersService,
  ) {}

  async submitNote(tweetId: number, author: string, content: string) {
    const user = await this.usersService.findByUsername(author);
    if (!user) throw new NotFoundException('User not found');

    const note = this.noteRepo.create({ tweet: { id: tweetId }, content: content, author: user, ratings: [] });
    return this.noteRepo.save(note);
  }

  async rateNote(noteId: number, username: string, helpful: boolean) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.ratingRepo.findOne({
      where: { note: { id: noteId }, user: { id: user.id } }
    });

    const note = await this.noteRepo.findOne({
      where: { id: noteId },
      relations: ['author', 'ratings'],
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.author.id === user.id) throw new BadRequestException("Can't rate your own note");

    if (existing) {
        if (existing.helpful === helpful) return;
        else existing.helpful = helpful;
        await this.ratingRepo.save(existing);
        await this.updateVisibility(note);
    } else {
        await this.ratingRepo.save({ note: { id: noteId }, user, helpful });
        await this.updateVisibility(note);
    }
  }

  private async updateVisibility(note: CommunityNote) {
    const ratings = await this.ratingRepo.find({ where: { note: { id: note.id } } });
    const helpfulCount = ratings.filter(r => r.helpful).length;
    const notHelpfulCount = ratings.filter(r => !r.helpful).length;

    const shouldBeVisible = helpfulCount >= this.HELPFUL_THRESHOLD && helpfulCount > notHelpfulCount;

    if (note.isVisible !== shouldBeVisible) {
      note.isVisible = shouldBeVisible;
      await this.noteRepo.save(note);
    }
  }

  async getNotesForTweet(tweetId: number) {
    return this.noteRepo.find({
      where: { tweet: { id: tweetId }, isVisible: true },
      relations: ['author', 'ratings'],
    });
  }

  async getAllNotesForTweet(tweetId: number) {
    const notes = await this.noteRepo.find({
      where: { tweet: { id: tweetId } },
      relations: ['author', 'ratings'],
      order: { createdAt: 'DESC' },
    });
    return notes.map((n) => ({
      id: n.id,
      content: n.content,
      isVisible: n.isVisible,
      authorUsername: n.author?.username ?? '',
      helpfulCount: (n.ratings ?? []).filter((r) => r.helpful).length,
      notHelpfulCount: (n.ratings ?? []).filter((r) => !r.helpful).length,
    }));
  }
}