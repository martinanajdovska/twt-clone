package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TweetService {
    Optional<TweetResponseDTO> save(String username, Long parentId, String content, String imageUrl);
    List<Tweet> findAllByUserUsername(String username);
    Optional<Tweet> findById(Long id);
    TweetResponseDTO convertToDTO(Tweet tweet);
    void deleteById(Long id, String username);
    TweetResponseDTO getTweetById(Long id);
    Page<Tweet> findTweetsByUserUsernameIn(List<String> followedUsernames, Pageable pageable);
    List<Tweet> findAllById(List<Long> ids);
}
