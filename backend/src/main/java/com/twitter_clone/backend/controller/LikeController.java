package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.LikeResponseDTO;
import com.twitter_clone.backend.service.LikeService;
import com.twitter_clone.backend.service.TweetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tweets")
public class LikeController {
    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{tweetId}/likes")
    public ResponseEntity<LikeResponseDTO> likeTweet(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        return this.likeService.save(userDetails.getUsername(),tweetId)
                .map(like -> ResponseEntity.status(HttpStatus.CREATED).body(like))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @GetMapping("/{tweetId}/likes")
    public ResponseEntity<Integer> countLikes(@PathVariable Long tweetId) {
        return ResponseEntity.ok(this.likeService.countLikes(tweetId));
    }

    @DeleteMapping("/{tweetId}/likes")
    public ResponseEntity<Void> unlikeTweet(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        this.likeService.delete(userDetails.getUsername(), tweetId);
        return ResponseEntity.noContent().build();
    }}
