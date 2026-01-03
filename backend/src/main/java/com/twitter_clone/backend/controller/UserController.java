package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.UserInfoDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.service.FeedService;
import com.twitter_clone.backend.service.ProfileService;
import com.twitter_clone.backend.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final FeedService feedService;
    private final ProfileService profileService;
    public UserController(UserService userService, FeedService feedService, ProfileService profileService) {
        this.userService = userService;
        this.feedService = feedService;
        this.profileService = profileService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<String>> getSearchResults(@RequestParam String search, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok().body(this.userService.findByUsernameContaining(search));
    }

    @GetMapping("/users/{username}")
    public ResponseEntity<UserResponseDTO> getProfile(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "5") int size,
                                                      @PathVariable String username,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Sort sort = Sort.by("created_at").descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            UserResponseDTO responseDTO = this.feedService.generateProfileFeed(username, pageable, userDetails.getUsername());
            return ResponseEntity.ok().body(responseDTO);
        } catch (UsernameNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getUsername(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok().body((Map.of("username", userDetails.getUsername())));
    }

    @GetMapping("/users/{username}/info")
    public ResponseEntity<UserInfoDTO> getInfo(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails) {
        return this.profileService.getUserInfo(username, userDetails.getUsername())
                .map(user->ResponseEntity.ok().body(user))
                .orElse(ResponseEntity.notFound().build());
    }
}
