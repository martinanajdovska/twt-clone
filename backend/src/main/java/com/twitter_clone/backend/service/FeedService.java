package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.TweetDetailsDTO;
import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface FeedService {
    Page<TweetResponseDTO> generateFeed(String username, Pageable pageable);
    TweetResponseDTO getTweetById(Long id, String username);
    UserResponseDTO generateProfileFeed(String username, Pageable pageable, String requester);
    TweetDetailsDTO getTweetDetails(Long id, String username, Pageable pageable);
}
