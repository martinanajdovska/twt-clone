package com.twitter_clone.backend.model.exceptions;

public class LikeNotFoundException extends RuntimeException {
    public LikeNotFoundException(String username, Long tweetId) {
        super(String.format("%s hasn't liked tweet %d",  username, tweetId));
    }
}
