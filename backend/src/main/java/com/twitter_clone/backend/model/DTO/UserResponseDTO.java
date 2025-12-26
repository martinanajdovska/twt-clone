package com.twitter_clone.backend.model.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserResponseDTO {
    Long id;
    String username;

    public UserResponseDTO(Long id, String username) {
        this.id = id;
        this.username = username;
    }
}
