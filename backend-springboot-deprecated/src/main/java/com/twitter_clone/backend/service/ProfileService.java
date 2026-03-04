package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.UserInfoDTO;

public interface ProfileService {
    UserInfoDTO getUserInfo(String username, String requester);
}
