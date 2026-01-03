package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.FollowResponseDTO;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.service.FollowService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class FollowController {
    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @GetMapping("/follows/{username}")
    public ResponseEntity<List<String>> getFollowedUsers(@PathVariable String username) {
        return ResponseEntity.ok(this.followService.getFollowingUsernames(username));
    }

    @PostMapping("/follows/{username}")
    public ResponseEntity<FollowResponseDTO> save(@PathVariable(name = "username") String followedUsername, @AuthenticationPrincipal UserDetails userDetails) {
        return this.followService.save(userDetails.getUsername(), followedUsername)
                .map(tweet -> ResponseEntity.status(HttpStatus.CREATED).body(tweet))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/follows/{username}")
    public ResponseEntity<Void> delete(@PathVariable(name = "username") String followedUsername, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            this.followService.delete(userDetails.getUsername(), followedUsername);
            return ResponseEntity.noContent().build();
        } catch (TweetNotFoundException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/followers/{username}")
    public ResponseEntity<List<String>> getFollowersForUser(@PathVariable String username) {

        return ResponseEntity.ok(this.followService.getFollowersUsernames(username));
    }
}
