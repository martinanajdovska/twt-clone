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

  @Column({ type: 'varchar', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Like, (l) => l.tweet)
  likes: Like[];

  @OneToMany(() => Retweet, (r) => r.tweet)
  retweets: Retweet[];
}
