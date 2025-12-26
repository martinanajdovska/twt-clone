package com.twitter_clone.backend.model.exceptions;

public class TweetNotFoundException extends RuntimeException {
    public TweetNotFoundException(Long message) {
        super(String.format("Tweet not found: %d", message));
    }
}
