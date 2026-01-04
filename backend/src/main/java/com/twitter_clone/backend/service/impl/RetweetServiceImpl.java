package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.RetweetResponseDTO;
import com.twitter_clone.backend.model.Retweet;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.*;
import com.twitter_clone.backend.repository.RetweetRepository;
import com.twitter_clone.backend.service.RetweetService;
import com.twitter_clone.backend.service.TweetService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RetweetServiceImpl implements RetweetService {
    private final RetweetRepository retweetRepository;
    private final UserService userService;
    private final TweetService tweetService;
    private final ModelMapper modelMapper;

    public RetweetServiceImpl(RetweetRepository retweetRepository, UserService userService, TweetService tweetService, ModelMapper modelMapper) {
        this.retweetRepository = retweetRepository;
        this.userService = userService;
        this.tweetService = tweetService;
        this.modelMapper = modelMapper;
    }

    @Override
    public boolean existsByTweetIdAndUsername(Long tweetId, String username) {
        return this.retweetRepository.existsByTweetIdAndUserUsername(tweetId,username);
    }

    @Override
    public Optional<RetweetResponseDTO> save(Long tweetId, String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        Tweet tweet = this.tweetService.findById(tweetId).orElseThrow(()->new TweetNotFoundException(tweetId));

        Retweet retweet = this.retweetRepository.save(new Retweet(user, tweet));
        return Optional.of(this.convertToDTO(retweet));
    }

    @Override
    public RetweetResponseDTO convertToDTO(Retweet retweet) {
        return this.modelMapper.map(retweet, RetweetResponseDTO.class);
    }

    @Override
    @Transactional
    public void delete(String username, Long tweetId) {
        Retweet retweet = this.retweetRepository.findByTweetIdAndUserUsername(tweetId,username).orElseThrow(RetweetNotFoundException::new);
        if (!retweet.getUser().getUsername().equals(username)) {
            throw new ActionNotAllowedException("Can't remove a retweet not made by this user");
        }
        this.retweetRepository.delete(retweet);
    }

    @Override
    public Integer countRetweets(Long tweetId) {
        Tweet tweet = this.tweetService.findById(tweetId).orElseThrow(()->new TweetNotFoundException(tweetId));

        return this.retweetRepository.countRetweetsByTweetId(tweetId);
    }

    @Override
    public List<Tweet> findRetweetsByUserUsername(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        List<Long> ids = this.retweetRepository.findTweetsIdsByUserUsername(username);
        return this.tweetService.findAllById(ids);
    }
}
