import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Tweet } from './tweet.entity';

@Entity('bookmark')
@Unique(['user', 'tweet'])
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tweet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tweet_id' })
  tweet: Tweet;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
