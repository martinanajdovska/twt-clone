package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UserResponseDTO {
    String username;
    List<TweetResponseDTO> tweets;

    public UserResponseDTO(String username, List<TweetResponseDTO> tweets) {
        this.username = username;
        this.tweets = tweets;
    }
}
