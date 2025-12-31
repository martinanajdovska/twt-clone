package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.service.FeedService;
import com.twitter_clone.backend.service.TweetService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final FeedService feedService;
    public UserController(UserService userService, FeedService feedService) {
        this.userService = userService;
        this.feedService = feedService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            // TODO: add pageable
            UserResponseDTO responseDTO = this.feedService.generateProfileFeed(userDetails.getUsername());
            return ResponseEntity.ok().body(responseDTO);
        } catch (UsernameNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }
}
