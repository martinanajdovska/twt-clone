package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class RetweetResponseDTO {
    private Long id;
    private String username;
    private Long tweetId;
    private LocalDateTime createdAt;

    public RetweetResponseDTO(Long id, String username, Long tweetId, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.tweetId = tweetId;
        this.createdAt = createdAt;
    }
}
