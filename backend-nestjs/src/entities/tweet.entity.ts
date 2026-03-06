import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Poll } from './poll.entity';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tweet, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parentTweet: Tweet | null;

  @ManyToOne(() => Tweet, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'quoted_tweet_id' })
  quotedTweet: Tweet | null;

  @Column({ name: 'deleted_quoted_tweet_id', type: 'int', nullable: true })
  deletedQuotedTweetId: number | null;

  @Column({ type: 'varchar', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'pinned_at', type: 'timestamptz', nullable: true })
  pinnedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToOne(() => Poll, (p) => p.tweet)
  poll: Poll | null;
}
