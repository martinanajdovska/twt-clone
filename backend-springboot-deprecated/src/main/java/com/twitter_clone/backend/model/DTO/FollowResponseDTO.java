package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class FollowResponseDTO {
    private Long id;
    private String followerUsername;
    private String followedUsername;
    private LocalDateTime createdAt;

    public FollowResponseDTO(Long id, String followerUsername, String followedUsername, LocalDateTime createdAt) {
        this.id = id;
        this.followerUsername = followerUsername;
        this.followedUsername = followedUsername;
        this.createdAt = createdAt;
    }
}
