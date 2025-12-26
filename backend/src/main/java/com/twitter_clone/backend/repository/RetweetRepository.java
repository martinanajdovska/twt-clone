package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Retweet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RetweetRepository extends JpaRepository<Retweet, Long> {
    Integer countRetweetsByTweetId (Long tweetId);
}
