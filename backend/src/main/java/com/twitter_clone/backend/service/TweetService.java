package com.twitter_clone.backend.service;


import com.twitter_clone.backend.model.Tweet;

import java.util.List;
import java.util.Optional;

public interface TweetService {
    Optional<Tweet> save(String username, Long parentId, String content, String imageUrl);
    List<Tweet> findAllByUserUsername(String username);
    Optional<Tweet> findById(Long id);
}
