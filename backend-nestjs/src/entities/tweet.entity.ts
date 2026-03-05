import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';
import { Retweet } from './retweet.entity';
import { CommunityNote } from './community-note.entity';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Tweet, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parentTweet: Tweet | null;

  @OneToMany(() => Tweet, (t) => t.parentTweet)
  replies: Tweet[];

  @ManyToOne(() => Tweet, { nullable: true })
  @JoinColumn({ name: 'quoted_tweet_id' })
  quotedTweet: Tweet | null;

  @Column({ type: 'varchar', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Like, (l) => l.tweet)
  likes: Like[];

  @OneToMany(() => Retweet, (r) => r.tweet)
  retweets: Retweet[];

  @OneToMany(() => CommunityNote, note => note.tweet, {nullable: true, onDelete: 'CASCADE'})
  notes: CommunityNote[];
}
