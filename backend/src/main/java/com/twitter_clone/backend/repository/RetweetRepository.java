package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Retweet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetweetRepository extends JpaRepository<Retweet, Long> {
    Integer countRetweetsByTweetId (Long tweetId);
    boolean existsByTweetIdAndUserUsername (Long tweetId, String username);
    Optional<Retweet> findByTweetIdAndUserUsername (Long tweetId, String username);
    @Query("SELECT r.tweet.id FROM Retweet r WHERE r.user.username = :username")
    List<Long> findTweetsIdsByUserUsername(@Param("username") String username);
}
