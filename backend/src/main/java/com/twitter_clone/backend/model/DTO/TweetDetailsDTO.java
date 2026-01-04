package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class TweetDetailsDTO {
    TweetResponseDTO tweet;
    List<TweetResponseDTO> replies;

    public TweetDetailsDTO(TweetResponseDTO tweet, List<TweetResponseDTO> replies) {
        this.tweet = tweet;
        this.replies = replies;
    }
}
