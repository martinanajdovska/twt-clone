package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface FeedService {
    List<TweetResponseDTO> generateFeed(String username, Pageable pageable);
    Optional<TweetResponseDTO> getTweetById(Long id);
    UserResponseDTO generateProfileFeed(String username);
}
