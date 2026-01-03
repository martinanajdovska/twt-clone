package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.UserInfoDTO;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.service.FollowService;
import com.twitter_clone.backend.service.ProfileService;
import com.twitter_clone.backend.service.UserService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileServiceImpl implements ProfileService {
    private final UserService userService;
    private final FollowService followService;

    public ProfileServiceImpl(UserService userService, FollowService followService) {
        this.userService = userService;
        this.followService = followService;
    }

    @Override
    public Optional<UserInfoDTO> getUserInfo(String username, String requester) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        UserInfoDTO userInfoDTO = new UserInfoDTO();
        userInfoDTO.setUsername(username);
        userInfoDTO.setFollowers(this.followService.getFollowerCount(username));
        userInfoDTO.setFollowing(this.followService.getFollowingCount(username));
        userInfoDTO.setFollowed(this.followService.existsFollowed(requester, username));
        userInfoDTO.setFollowsYou(this.followService.existsFollowingYou(username, requester));

        return Optional.of(userInfoDTO);
    }
}
