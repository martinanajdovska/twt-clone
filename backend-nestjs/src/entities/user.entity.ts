import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Tweet } from './tweet.entity';
import { Like } from './like.entity';
import { Retweet } from './retweet.entity';
import { Follow } from './follow.entity';

export enum Role {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
  GROK = 'ROLE_GROK',
}

@Entity('twitter_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  firebaseUid: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  bannerUrl: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  website: string | null;

  @Column({ type: 'date', nullable: true })
  birthday: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  displayName: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Tweet, (t) => t.user)
  tweets: Tweet[];

  @OneToMany(() => Like, (l) => l.user)
  likes: Like[];

  @OneToMany(() => Retweet, (r) => r.user)
  retweets: Retweet[];

  @OneToMany(() => Follow, (f) => f.follower)
  following: Follow[];

  @OneToMany(() => Follow, (f) => f.followed)
  followers: Follow[];
}
