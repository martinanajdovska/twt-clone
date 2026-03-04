package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class TweetDetailsDTO {
    TweetResponseDTO tweet;
    TweetResponseDTO parentTweet;
    List<TweetResponseDTO> replies;

    public TweetDetailsDTO(TweetResponseDTO tweet, TweetResponseDTO parentTweet, List<TweetResponseDTO> replies) {
        this.tweet = tweet;
        this.parentTweet = parentTweet;
        this.replies = replies;
    }
}
