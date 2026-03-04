package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.LikeResponseDTO;
import com.twitter_clone.backend.service.LikeService;
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
    public ResponseEntity<LikeResponseDTO> save(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.likeService.save(userDetails.getUsername(),tweetId));
    }

    @GetMapping("/{tweetId}/likes")
    public ResponseEntity<Integer> count(@PathVariable Long tweetId) {
        return ResponseEntity.ok(this.likeService.countLikes(tweetId));
    }

    @DeleteMapping("/{tweetId}/likes")
    public ResponseEntity<Void> delete(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        this.likeService.delete(userDetails.getUsername(), tweetId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }}
