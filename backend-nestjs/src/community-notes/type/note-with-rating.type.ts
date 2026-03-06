import { CommunityNote } from 'src/entities/community-note.entity';
import { NoteRating } from 'src/entities/note-rating.entity';

export type NoteWithRatings = CommunityNote & { ratings: NoteRating[] };
