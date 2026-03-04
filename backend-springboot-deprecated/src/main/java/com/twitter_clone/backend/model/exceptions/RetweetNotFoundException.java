package com.twitter_clone.backend.model.exceptions;

public class RetweetNotFoundException extends RuntimeException {
    public RetweetNotFoundException(String username, Long tweetId) {
        super(String.format("%s hasn't retweeted tweet %d", username, tweetId));
    }
}
