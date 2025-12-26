package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.Like;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.LikeNotFoundException;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.repository.LikeRepository;
import com.twitter_clone.backend.service.LikeService;
import com.twitter_clone.backend.service.TweetService;
import com.twitter_clone.backend.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LikeServiceImpl implements LikeService {
    private final LikeRepository likeRepository;
    private final UserService userService;
    private final TweetService tweetService;

    public LikeServiceImpl(LikeRepository likeRepository, UserService userService, TweetService tweetService) {
        this.likeRepository = likeRepository;
        this.userService = userService;
        this.tweetService = tweetService;
    }

    @Override
    public Optional<Like> save(String username, Long tweetId) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        Tweet tweet = this.tweetService.findById(tweetId).orElseThrow(()->new TweetNotFoundException(tweetId));

        return Optional.of(this.likeRepository.save(new Like(user, tweet)));
    }

    @Override
    public Integer countLikes(Long tweetId) {
        Tweet tweet = this.tweetService.findById(tweetId).orElseThrow(()->new TweetNotFoundException(tweetId));

        return this.likeRepository.countLikesByTweetId(tweetId);
    }

    @Override
    @Transactional
    public void delete(String username, Long tweetId) {
        this.likeRepository.findByTweetIdAndUserUsername(tweetId,username).orElseThrow(LikeNotFoundException::new);
        this.likeRepository.deleteByTweetIdAndUserUsername(tweetId,username);
    }
}
