package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface TweetService {
    TweetResponseDTO save(String username, Long parentId, String content, MultipartFile file);
    List<Tweet> findAllParentTweetsByUsername(String username);
    List<Tweet> findAllParentTweetsByUsernames(List<String> followedUsernames);
    Optional<Tweet> findById(Long id);
    TweetResponseDTO convertToDTO(Tweet tweet);
    void deleteById(Long id, String username);
    TweetResponseDTO getTweetById(Long id);
    List<Tweet> findAllById(List<Long> ids);
    List<Tweet> findAllRepliesOfTweet(Long id, Pageable pageable);
}
