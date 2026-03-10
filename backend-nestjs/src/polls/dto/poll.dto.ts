import { PollOptionDto } from './poll-option.dto';

export interface PollDto {
  id: number;
  endsAt: string;
  options: PollOptionDto[];
  selectedOptionId: number | null;
  isClosed: boolean;
}
