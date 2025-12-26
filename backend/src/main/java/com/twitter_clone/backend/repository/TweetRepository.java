package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Tweet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TweetRepository extends JpaRepository<Tweet,Long> {
    List<Tweet> findAllByUserUsername(String username);
    Page<Tweet> findTweetsByUserUsernameIn(List<String> usernames, Pageable pageable);
}
