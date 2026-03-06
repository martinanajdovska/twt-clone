import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Poll } from './poll.entity';
import { PollOption } from './poll-option.entity';

@Entity('poll_vote')
@Unique(['user', 'poll'])
export class PollVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Poll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @ManyToOne(() => PollOption, (o) => o.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_option_id' })
  pollOption: PollOption;
}
