import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityNote } from './community-note.entity';
import { User } from './user.entity';

@Entity()
export class NoteRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityNote, { onDelete: 'CASCADE' })
  note: CommunityNote;

  @ManyToOne(() => User)
  user: User;

  @Column()
  isHelpful: boolean;
}
