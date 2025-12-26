package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like,Long> {
    Integer countLikesByTweetId(Long tweetId);
    Optional<Like> findByTweetIdAndUserUsername(Long tweetId, String username);
    void deleteByTweetIdAndUserUsername(Long tweetId, String username);
}
