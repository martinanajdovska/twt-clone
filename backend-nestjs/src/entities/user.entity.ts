import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Tweet } from './tweet.entity';
import { Like } from './like.entity';
import { Retweet } from './retweet.entity';
import { Follow } from './follow.entity';

export enum Role {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
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
