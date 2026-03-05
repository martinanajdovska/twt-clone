import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tweet } from "./tweet.entity";
import { User } from "./user.entity";
import { NoteRating } from "./note-rating.entity";

@Entity()
export class CommunityNote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tweet, { onDelete: 'CASCADE' })
  tweet: Tweet;

  @ManyToOne(() => User)
  author: User;

  @Column()
  content: string;

  @Column({ default: false })
  isVisible: boolean;

  @OneToMany(() => NoteRating, rating => rating.note)
  ratings: NoteRating[];

  @CreateDateColumn()
  createdAt: Date;
}