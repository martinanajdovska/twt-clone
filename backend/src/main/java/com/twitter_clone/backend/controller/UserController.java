package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.service.FeedService;
import com.twitter_clone.backend.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final FeedService feedService;
    public UserController(UserService userService, FeedService feedService) {
        this.userService = userService;
        this.feedService = feedService;
    }

    @GetMapping("/users/{username}")
    public ResponseEntity<UserResponseDTO> getProfile(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "5") int size,
                                                      @PathVariable String username,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Sort sort = Sort.by("createdAt").descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            if (username.equals(userDetails.getUsername())) {
                username = userDetails.getUsername();
            }
            UserResponseDTO responseDTO = this.feedService.generateProfileFeed(username, pageable);
            return ResponseEntity.ok().body(responseDTO);
        } catch (UsernameNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getUsername(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok().body((Map.of("username", userDetails.getUsername())));
    }
}
