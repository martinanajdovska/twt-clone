package com.twitter_clone.backend.service;

import java.util.List;

public interface FollowService {
    List<Long> followedIds(String username);
}
