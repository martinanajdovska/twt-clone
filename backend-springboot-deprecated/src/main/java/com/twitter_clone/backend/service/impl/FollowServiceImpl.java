package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.FollowResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Follow;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.enums.NotificationType;
import com.twitter_clone.backend.model.exceptions.FollowNotFoundException;
import com.twitter_clone.backend.repository.FollowRepository;
import com.twitter_clone.backend.service.FollowService;
import com.twitter_clone.backend.service.NotificationService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowServiceImpl implements FollowService {
    private final FollowRepository followRepository;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;

    public FollowServiceImpl(FollowRepository followRepository, UserService userService, ModelMapper modelMapper, NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userService = userService;
        this.modelMapper = modelMapper;
        this.notificationService = notificationService;
    }

    @Override
    public FollowResponseDTO save(String follower, String followed) {
        User followerUser = this.userService.findByUsername(follower).orElseThrow(()-> new UsernameNotFoundException(follower));
        User followedUser = this.userService.findByUsername(followed).orElseThrow(()-> new UsernameNotFoundException(followed));

        Follow follow = this.followRepository.save(new Follow(followerUser, followedUser));

        notificationService.createNotification(followed, follower, "followed you!", "/users/"+follower, NotificationType.FOLLOW);

        return convertToDTO(follow);
    }

    @Override
    @Transactional
    public void delete(String follower, String followed) {
        Follow follow = this.followRepository.findByFollowerUsernameAndFollowedUsername(follower, followed)
                .orElseThrow(()->new FollowNotFoundException(follower,followed));
        this.followRepository.delete(follow);
    }

//    TODO: redo this with UserInfoDTO instead
    @Override
    public List<UserResponseDTO> getFollowingUsers(String username) {
        List<String> followedUsernames = this.getFollowingUsernames(username);
        List<User> users = new ArrayList<>();
        for (String followed : followedUsernames) {
            User user = this.userService.findByUsername(followed).orElseThrow(()-> new UsernameNotFoundException(followed));
            users.add(user);
        }

        return users.stream().map(this.userService::convertToDTO)
                .collect(Collectors.toList());
    }

    //    TODO: redo this with UserInfoDTO instead
    @Override
    public List<UserResponseDTO> getFollowersUsers(String username) {
        List<String> followersUsernames = this.getFollowersUsernames(username);
        List<User> users = new ArrayList<>();
        for (String follower : followersUsernames) {
            User user = this.userService.findByUsername(follower).orElseThrow(()-> new UsernameNotFoundException(follower));
            users.add(user);
        }

        return users.stream().map(this.userService::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getFollowingUsernames(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.findFollowedUsernamesByUserUsername(username);
    }

    @Override
    public List<String> getFollowersUsernames(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.findFollowersUsernamesForUserUsername(username);
    }

    @Override
    public FollowResponseDTO convertToDTO(Follow follow) {
        return this.modelMapper.map(follow, FollowResponseDTO.class);
    }

    @Override
    public Integer getFollowerCount(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.countByFollowedUsername(username);
    }

    @Override
    public Integer getFollowingCount(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.countByFollowerUsername(username);
    }

    @Override
    public boolean existsFollowingYou(String follower, String followed) {
        return this.followRepository.existsByFollowedUsernameAndFollowerUsername(followed, follower);
    }

    @Override
    public boolean existsFollowed(String follower, String followed) {
        return this.followRepository.existsByFollowerUsernameAndFollowedUsername(follower, followed);
    }

}
