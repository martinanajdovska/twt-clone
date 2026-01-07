package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.TweetDetailsDTO;
import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.service.FeedService;
import com.twitter_clone.backend.service.TweetService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tweets")
public class TweetController {
    private final TweetService tweetService;
    private final FeedService feedService;

    public TweetController(TweetService tweetService, FeedService feedService) {
        this.tweetService = tweetService;
        this.feedService = feedService;
    }

    @GetMapping
    public ResponseEntity<Page<TweetResponseDTO>> generateFeed(@RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "5") int size,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        Pageable pageable = PageRequest.of(page, size);

        return ResponseEntity.ok(this.feedService.generateFeed(userDetails.getUsername(), pageable));
    }

    @PostMapping
    public ResponseEntity<TweetResponseDTO> save(@RequestParam String content, @RequestParam(required = false) Long parentId,
                                                 @RequestParam(required = false) MultipartFile image,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.tweetService
                .save(userDetails.getUsername(), parentId, content, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        this.tweetService.deleteById(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TweetResponseDTO> getTweet(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok().body(this.feedService.getTweetById(id, userDetails.getUsername()));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<TweetDetailsDTO> getDetails(@PathVariable Long id,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "5") int size,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok().body(this.feedService.getTweetDetails(id, userDetails.getUsername(), pageable));
    }
}
