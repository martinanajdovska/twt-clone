package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Follow;

import java.util.List;
import java.util.Optional;

public interface FollowService {
    List<String> followedUsernames(String username);
    Optional<Follow> save (String follower, String followed);
    void delete(String follower, String followed);
    List<UserResponseDTO> followedUsers(String username);
}
