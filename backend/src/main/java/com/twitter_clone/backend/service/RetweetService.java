package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.DTO.RetweetResponseDTO;
import com.twitter_clone.backend.model.Retweet;
import com.twitter_clone.backend.model.Tweet;

import java.util.List;
import java.util.Optional;

public interface RetweetService {
    boolean existsByTweetIdAndUsername(Long tweetId, String username);
    RetweetResponseDTO save(Long tweetId, String username);
    RetweetResponseDTO convertToDTO(Retweet retweet);
    void delete(String username, Long tweetId);
    Integer countRetweets(Long tweetId);
    List<Tweet> findRetweetsByUsername(String username);
    List<Retweet> findRetweetsByUsernames(List<String> usernames);
}
