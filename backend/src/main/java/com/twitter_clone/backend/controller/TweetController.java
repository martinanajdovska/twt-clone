package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.TweetRequest;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.service.TweetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tweets")
public class TweetController {
    private final TweetService tweetService;

    public TweetController(TweetService tweetService) {
        this.tweetService = tweetService;
    }

    //    TODO: change params after frontend
    @GetMapping
    public List<Tweet> findAll(@RequestParam(required = true) String username) {
        return this.tweetService.findAllByUserUsername(username);
    }


    @PostMapping()
    public ResponseEntity<Tweet> save(@RequestBody TweetRequest request) {
        return this.tweetService
                .save(
                        request.getUsername(),
                        request.getParentId(),
                        request.getContent(),
                        request.getImageUrl()
                )
                .map(tweet -> ResponseEntity.status(HttpStatus.CREATED).body(tweet))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    //TODO: delete tweet

}
