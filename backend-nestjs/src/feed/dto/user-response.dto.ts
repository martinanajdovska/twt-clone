import { TweetResponseDto } from 'src/tweets/dto/tweet-response.dto';

export interface UserResponseDto {
  username: string;
  tweets: TweetResponseDto[];
}
