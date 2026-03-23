import { TweetResponseDto } from 'src/tweets/dto/tweet-response.dto';

export interface TweetDetailsDto {
  tweet: TweetResponseDto;
  parentTweet: TweetResponseDto | null;
  parentChain: TweetResponseDto[];
  replies: TweetResponseDto[];
}
