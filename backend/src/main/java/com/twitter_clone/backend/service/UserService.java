package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.enums.Role;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User register(String username, String password, Role role, String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndPassword(String username, String password);
    UserResponseDTO convertToDTO(User user);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<String> findByUsernameContaining(String username);
}
