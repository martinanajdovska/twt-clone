import { Tweet } from 'src/entities/tweet.entity';
import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';

export type TweetWithNotes = Tweet & {
  notes?: (CommunityNote & { ratings?: NoteRating[] })[];
};
