package com.twitter_clone.backend.service;


import com.twitter_clone.backend.model.Like;

import java.util.Optional;

public interface LikeService {
    Optional<Like> save(String username, Long tweetId);
    Integer countLikes(Long tweetId);
    void delete(String username, Long tweetId);
}
