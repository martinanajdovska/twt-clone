package com.twitter_clone.backend.service;


import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TweetService {
    Optional<TweetResponseDTO> save(String username, Long parentId, String content, String imageUrl);
    List<Tweet> findAllByUserUsername(String username);
    Optional<Tweet> findById(Long id);
    List<TweetResponseDTO> generateFeed(String username, Pageable pageable);
    TweetResponseDTO convertToDTO(Tweet tweet);
    void deleteById(Long id, String username);
}
