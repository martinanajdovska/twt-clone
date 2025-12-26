package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Follow;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.FollowNotFoundException;
import com.twitter_clone.backend.repository.FollowRepository;
import com.twitter_clone.backend.service.FollowService;
import com.twitter_clone.backend.service.UserService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FollowServiceImpl implements FollowService {
    private final FollowRepository followRepository;
    private final UserService userService;

    public FollowServiceImpl(FollowRepository followRepository, UserService userService) {
        this.followRepository = followRepository;
        this.userService = userService;
    }

    @Override
    public List<String> followedUsernames(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.findFollowedUsernamesByFollowerId(user.getId());
    }

    @Override
    public Optional<Follow> save(String follower, String followed) {
        User followerUser = this.userService.findByUsername(follower).orElseThrow(()-> new UsernameNotFoundException(follower));
        User followedUser = this.userService.findByUsername(followed).orElseThrow(()-> new UsernameNotFoundException(followed));

        return Optional.of(this.followRepository.save(new Follow(followerUser, followedUser)));
    }

    @Override
    public void delete(String follower, String followed) {
        Follow follow = this.followRepository.findByFollowerUsernameAndFollowedUsername(follower, followed).orElseThrow(FollowNotFoundException::new);
        this.followRepository.delete(follow);
    }

    @Override
    public List<UserResponseDTO> followedUsers(String username) {
        List<String> followedUsernames = this.followedUsernames(username);
        List<User> users = new ArrayList<>();
        for (String followed : followedUsernames) {
            User user = this.userService.findByUsername(followed).orElseThrow(()-> new UsernameNotFoundException(followed));
            users.add(user);
        }

        return users.stream().map(this.userService::convertToDTO)
                .collect(Collectors.toList());
    }
}
