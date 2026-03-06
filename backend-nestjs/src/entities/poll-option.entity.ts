import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Poll } from './poll.entity';

@Entity('poll_option')
export class PollOption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Poll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @Column({ type: 'varchar', length: 25 })
  label: string;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;
}
