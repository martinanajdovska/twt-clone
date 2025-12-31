package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UserResponseDTO {
    String username;
    Integer followers;
    Integer following;
    List<TweetResponseDTO> tweets;

    public UserResponseDTO(String username, Integer followers, Integer following, List<TweetResponseDTO> tweets) {
        this.username = username;
        this.followers = followers;
        this.following = following;
        this.tweets = tweets;
    }
}
