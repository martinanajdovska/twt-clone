package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.FollowResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Follow;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.FollowNotFoundException;
import com.twitter_clone.backend.repository.FollowRepository;
import com.twitter_clone.backend.service.FollowService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
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
    private final ModelMapper modelMapper;

    public FollowServiceImpl(FollowRepository followRepository, UserService userService, ModelMapper modelMapper) {
        this.followRepository = followRepository;
        this.userService = userService;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<String> getFollowedUsernames(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.findFollowedUsernamesByFollowerId(user.getId());
    }

    @Override
    public Optional<FollowResponseDTO> save(String follower, String followed) {
        User followerUser = this.userService.findByUsername(follower).orElseThrow(()-> new UsernameNotFoundException(follower));
        User followedUser = this.userService.findByUsername(followed).orElseThrow(()-> new UsernameNotFoundException(followed));

        Follow follow = this.followRepository.save(new Follow(followerUser, followedUser));
        return Optional.of(convertToDTO(follow));
    }

    @Override
    public void delete(String follower, String followed) {
        Follow follow = this.followRepository.findByFollowerUsernameAndFollowedUsername(follower, followed).orElseThrow(FollowNotFoundException::new);
        this.followRepository.delete(follow);
    }

    @Override
    public List<UserResponseDTO> getFollowedUsers(String username) {
        List<String> followedUsernames = this.getFollowedUsernames(username);
        List<User> users = new ArrayList<>();
        for (String followed : followedUsernames) {
            User user = this.userService.findByUsername(followed).orElseThrow(()-> new UsernameNotFoundException(followed));
            users.add(user);
        }

        return users.stream().map(this.userService::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getFollowersUsernames(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.followRepository.findFollowersUsernames(username);
    }

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
    public FollowResponseDTO convertToDTO(Follow follow) {
        return this.modelMapper.map(follow, FollowResponseDTO.class);
    }

}
