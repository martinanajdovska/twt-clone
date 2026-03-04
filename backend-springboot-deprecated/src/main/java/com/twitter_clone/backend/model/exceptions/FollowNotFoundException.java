package com.twitter_clone.backend.model.exceptions;

public class FollowNotFoundException extends RuntimeException {
    public FollowNotFoundException(String follower, String followed) {
        super(String.format("User %s doesn't follow %s", follower, followed));
    }
}
