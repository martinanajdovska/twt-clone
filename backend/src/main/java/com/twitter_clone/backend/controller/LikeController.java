package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.LikeResponseDTO;
import com.twitter_clone.backend.model.Like;
import com.twitter_clone.backend.service.LikeService;
import com.twitter_clone.backend.service.TweetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tweets")
public class LikeController {
    private final LikeService likeService;

    public LikeController(LikeService likeService, TweetService tweetService) {
        this.likeService = likeService;
    }

    //    TODO: refactor params after frontend auth
    @PostMapping("/{tweetId}/likes")
    public ResponseEntity<LikeResponseDTO> likeTweet(@PathVariable Long tweetId, @RequestParam String username) {
        return this.likeService.save(username,tweetId)
                .map(like -> ResponseEntity.status(HttpStatus.CREATED).body(like))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @GetMapping("/{tweetId}/likes")
    public ResponseEntity<Integer> countLikes(@PathVariable Long tweetId) {
        return ResponseEntity.ok(this.likeService.countLikes(tweetId));
    }

    //    TODO: change username param after frontend
    @DeleteMapping("/{tweetId}/likes")
    public ResponseEntity<Void> unlikeTweet(@PathVariable Long tweetId, @RequestParam String username) {
        this.likeService.delete(username, tweetId);
        return ResponseEntity.noContent().build();
    }}
