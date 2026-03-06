import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tweet } from './tweet.entity';
import { PollOption } from './poll-option.entity';

@Entity('poll')
export class Poll {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Tweet, (t) => t.poll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tweet_id' })
  tweet: Tweet;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;

  @OneToMany(() => PollOption, (opt) => opt.poll, { cascade: true })
  options: PollOption[];
}
