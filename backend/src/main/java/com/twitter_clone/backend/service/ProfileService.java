package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.UserInfoDTO;

import java.util.Optional;

public interface ProfileService {
    Optional<UserInfoDTO> getUserInfo(String username, String requester);
}
