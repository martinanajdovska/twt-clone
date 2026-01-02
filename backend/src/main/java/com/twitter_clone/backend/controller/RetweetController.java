package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.RetweetResponseDTO;
import com.twitter_clone.backend.service.RetweetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tweets")
public class RetweetController {
    private final RetweetService retweetService;

    public RetweetController(RetweetService retweetService) {
        this.retweetService = retweetService;
    }

    @PostMapping("/{tweetId}/retweets")
    public ResponseEntity<RetweetResponseDTO> retweetTweet(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        return this.retweetService.save(tweetId, userDetails.getUsername())
                .map(retweet -> ResponseEntity.status(HttpStatus.CREATED).body(retweet))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @GetMapping("/{tweetId}/retweets")
    public ResponseEntity<Integer> countRetweets(@PathVariable Long tweetId) {
        return ResponseEntity.ok(this.retweetService.countRetweets(tweetId));
    }

    @DeleteMapping("/{tweetId}/retweets")
    public ResponseEntity<Void> unRetweetTweet(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        this.retweetService.delete(userDetails.getUsername(), tweetId);
        return ResponseEntity.noContent().build();
    }
}
