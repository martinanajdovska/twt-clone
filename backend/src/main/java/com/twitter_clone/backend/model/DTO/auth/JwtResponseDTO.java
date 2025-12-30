package com.twitter_clone.backend.model.DTO.auth;

import com.twitter_clone.backend.model.enums.Role;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JwtResponseDTO {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private Role role;
}