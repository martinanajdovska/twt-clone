package com.twitter_clone.backend.service;


import com.twitter_clone.backend.model.DTO.LikeResponseDTO;
import com.twitter_clone.backend.model.Like;

import java.util.Optional;

public interface LikeService {
    LikeResponseDTO save(String username, Long tweetId);
    Integer countLikes(Long tweetId);
    void delete(String username, Long tweetId);
    LikeResponseDTO convertToDTO(Like like);
    boolean existsByTweetIdAndUsername(Long tweetId, String username);
}
