package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserResponseDTO {
    String username;

    public UserResponseDTO(String username) {
        this.username = username;
    }
}
