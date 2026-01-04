package com.twitter_clone.backend.repository;

import com.twitter_clone.backend.model.Tweet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TweetRepository extends JpaRepository<Tweet,Long> {

    List<Tweet> findAllByUserUsernameAndParentTweetIsNull(String username);
    Page<Tweet> findTweetsByUserUsernameIsIn(List<String> usernames, Pageable pageable);
    List<Tweet> findAllByIdIsIn(List<Long> ids);
    List<Tweet> findAllByParentTweet(Tweet tweet, Pageable pageable);
}
