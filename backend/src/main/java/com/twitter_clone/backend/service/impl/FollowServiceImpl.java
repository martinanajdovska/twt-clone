package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.repository.FollowRepository;
import com.twitter_clone.backend.service.FollowService;
import com.twitter_clone.backend.service.UserService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FollowServiceImpl implements FollowService {
    private final FollowRepository followRepository;
    private final UserService userService;

    public FollowServiceImpl(FollowRepository followRepository, UserService userService) {
        this.followRepository = followRepository;
        this.userService = userService;
    }

    @Override
    public List<Long> followedIds(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.findFollowedIdsByFollowerId(user.getId());
    }
}
