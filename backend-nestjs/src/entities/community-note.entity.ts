import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tweet } from './tweet.entity';
import { User } from './user.entity';

@Entity()
export class CommunityNote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tweet, { onDelete: 'CASCADE' })
  tweet: Tweet;

  @ManyToOne(() => User)
  author: User;

  @Column()
  content: string;

  @Column({ default: false })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;
}