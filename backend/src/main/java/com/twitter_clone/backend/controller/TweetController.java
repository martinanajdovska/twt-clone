package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.TweetRequestDTO;
import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.service.FeedService;
import com.twitter_clone.backend.service.LikeService;
import com.twitter_clone.backend.service.TweetService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tweets")
public class TweetController {
    private final TweetService tweetService;
    private final FeedService feedService;

    public TweetController(TweetService tweetService, FeedService feedService) {
        this.tweetService = tweetService;
        this.feedService = feedService;
    }

//    TODO: refactor params after frontend auth

//    TODO: move generating feed to user controller and change api url
    @GetMapping
    public List<TweetResponseDTO> generateFeed(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "5") int size,
                                               @RequestParam String username){
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return this.feedService.generateFeed(username, pageable);
    }

    @PostMapping
    public ResponseEntity<TweetResponseDTO> save(@RequestBody TweetRequestDTO request) {
        return this.tweetService
                .save(
                        request.getUsername(),
                        request.getParentId(),
                        request.getContent(),
                        request.getImageUrl()
                )
                .map(tweet -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(tweet))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam String username) {
        try {
            this.tweetService.deleteById(id, username);
            return ResponseEntity.noContent().build();
        } catch (TweetNotFoundException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TweetResponseDTO> getTweet(@PathVariable Long id) {
        return this.feedService.getTweetById(id)
                .map(tweet->ResponseEntity.ok().body(tweet))
                .orElse(ResponseEntity.notFound().build());
    }
}
