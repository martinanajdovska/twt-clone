package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserInfoDTO {
    String username;
    Integer followers;
    Integer following;
    boolean followed;
    boolean followsYou;

    public UserInfoDTO(String username, Integer followers, Integer following, boolean followed, boolean followsYou) {
        this.username = username;
        this.followers = followers;
        this.following = following;
        this.followed = followed;
        this.followsYou = followsYou;
    }
}
