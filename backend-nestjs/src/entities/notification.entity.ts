import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  LIKE = 'LIKE',
  RETWEET = 'RETWEET',
  REPLY = 'REPLY',
  FOLLOW = 'FOLLOW',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipient: string;

  @Column()
  actor: string;

  @Column()
  message: string;

  @Column()
  link: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;
}
