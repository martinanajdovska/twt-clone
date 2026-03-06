import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';
import { Retweet } from './retweet.entity';
import { CommunityNote } from './community-note.entity';
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

  @OneToMany(() => Tweet, (t) => t.parentTweet)
  replies: Tweet[];

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

  @OneToMany(() => Like, (l) => l.tweet)
  likes: Like[];

  @OneToMany(() => Retweet, (r) => r.tweet)
  retweets: Retweet[];

  @OneToMany(() => CommunityNote, note => note.tweet, {nullable: true, onDelete: 'CASCADE'})
  notes: CommunityNote[];

  @OneToOne(() => Poll, (p) => p.tweet)
  poll: Poll | null;
}
