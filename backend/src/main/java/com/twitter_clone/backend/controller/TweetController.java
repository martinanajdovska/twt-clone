package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.DTO.TweetDetailsDTO;
import com.twitter_clone.backend.model.DTO.TweetRequestDTO;
import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.service.FeedService;
import com.twitter_clone.backend.service.TweetService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tweets")
public class TweetController {
    private final TweetService tweetService;
    private final FeedService feedService;

    public TweetController(TweetService tweetService, FeedService feedService) {
        this.tweetService = tweetService;
        this.feedService = feedService;
    }

//    TODO: move generating feed to user controller and change api url
    @GetMapping
    public List<TweetResponseDTO> generateFeed(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "5") int size,
                                               @AuthenticationPrincipal UserDetails userDetails){
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return this.feedService.generateFeed(userDetails.getUsername(), pageable);
    }

    @PostMapping
    public ResponseEntity<TweetResponseDTO> save(@RequestBody TweetRequestDTO request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return this.tweetService
                .save(
                        userDetails.getUsername(),
                        request.getParentId(),
                        request.getContent(),
                        request.getImageUrl()
                )
                .map(tweet -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(tweet))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            this.tweetService.deleteById(id, userDetails.getUsername());
            return ResponseEntity.noContent().build();
        } catch (TweetNotFoundException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TweetResponseDTO> getTweet(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        return this.feedService.getTweetById(id, userDetails.getUsername())
                .map(tweet->ResponseEntity.ok().body(tweet))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<TweetDetailsDTO> getDetails(@PathVariable Long id,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "5") int size,
                                                      @AuthenticationPrincipal UserDetails userDetails){
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return this.feedService.getTweetDetails(id, userDetails.getUsername(), pageable)
                .map(res->ResponseEntity.ok().body(res))
                .orElse(ResponseEntity.notFound().build());
    }
}
