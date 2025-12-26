package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Tweet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TweetRepository extends JpaRepository<Tweet,Long> {
    List<Tweet> findAllByUserUsername(String username);
}
