package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.RetweetResponseDTO;
import com.twitter_clone.backend.model.exceptions.LikeNotFoundException;
import com.twitter_clone.backend.model.exceptions.RetweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.service.RetweetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tweets")
public class RetweetController {
    private final RetweetService retweetService;

    public RetweetController(RetweetService retweetService) {
        this.retweetService = retweetService;
    }

    @PostMapping("/{tweetId}/retweets")
    public ResponseEntity<RetweetResponseDTO> save(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.retweetService.save(tweetId, userDetails.getUsername()));
    }

    @GetMapping("/{tweetId}/retweets")
    public ResponseEntity<Integer> count(@PathVariable Long tweetId) {
        return ResponseEntity.ok(this.retweetService.countRetweets(tweetId));
    }

    @DeleteMapping("/{tweetId}/retweets")
    public ResponseEntity<Void> delete(@PathVariable Long tweetId, @AuthenticationPrincipal UserDetails userDetails) {
        this.retweetService.delete(userDetails.getUsername(), tweetId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
