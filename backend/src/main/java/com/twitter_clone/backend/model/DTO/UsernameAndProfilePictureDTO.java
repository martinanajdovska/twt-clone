package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UsernameAndProfilePictureDTO {
    private String username;
    private String profilePicture;

    public UsernameAndProfilePictureDTO(String username, String profilePicture) {
        this.username = username;
        this.profilePicture = profilePicture;
    }
}
