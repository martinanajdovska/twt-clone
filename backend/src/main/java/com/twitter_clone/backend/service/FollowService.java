package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.FollowResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Follow;

import java.util.List;
import java.util.Optional;

public interface FollowService {
    List<String> getFollowedUsernames(String username);
    Optional<FollowResponseDTO> save (String follower, String followed);
    void delete(String follower, String followed);
    List<UserResponseDTO> getFollowedUsers(String username);
    List<String> getFollowersUsernames(String username);
    List<UserResponseDTO> getFollowersUsers(String username);
    FollowResponseDTO convertToDTO(Follow follow);
}
