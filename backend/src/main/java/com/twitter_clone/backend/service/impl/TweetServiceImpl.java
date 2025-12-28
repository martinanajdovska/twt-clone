package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.ActionNotAllowedException;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.repository.TweetRepository;
import com.twitter_clone.backend.service.TweetService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TweetServiceImpl implements TweetService {
    private final TweetRepository tweetRepository;
    private final UserService userService;
    private final ModelMapper modelMapper;

    public TweetServiceImpl(TweetRepository tweetRepository, UserService userService, ModelMapper modelMapper) {
        this.tweetRepository = tweetRepository;
        this.userService = userService;
        this.modelMapper = modelMapper;
    }

//    TODO: image handling

    //    TODO: check if content length >=255 and disable submitting on frontend
    public Optional<TweetResponseDTO> save(String username, Long parentId, String content, String imageUrl) {
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Can't post empty tweet");
        }

        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        Tweet parentTweet = null;
        if (parentId != null) {
            parentTweet = this.tweetRepository.findById(parentId).orElseThrow(()-> new TweetNotFoundException(parentId));
        }

        Tweet tweet = this.tweetRepository.save(new Tweet(user, parentTweet, content, imageUrl));
        return Optional.of(this.convertToDTO(tweet));
    }

    public List<Tweet> findAllByUserUsername(String username) {
        return this.tweetRepository.findAllByUserUsername(username);
    }

    @Override
    public Optional<Tweet> findById(Long id) {
        return this.tweetRepository.findById(id);
    }

    @Override
    public TweetResponseDTO convertToDTO(Tweet tweet) {
        return this.modelMapper.map(tweet, TweetResponseDTO.class);
    }

    @Override
    public void deleteById(Long id, String username) {
        Tweet tweet = this.tweetRepository.findById(id).orElseThrow(() -> new TweetNotFoundException(id));
        User user = this.userService.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
        if (!tweet.getUser().getUsername().equals(username)) {
            throw new ActionNotAllowedException("Can't delete another user's tweet");
        }

        this.tweetRepository.delete(tweet);
    }

    @Override
    public TweetResponseDTO getTweetById(Long id) {
        Tweet tweet = this.tweetRepository.findById(id).orElseThrow(() -> new TweetNotFoundException(id));

        return this.convertToDTO(tweet);
    }

    @Override
    public Page<Tweet> findTweetsByUserUsernameIn(List<String> followedUsernames, Pageable pageable) {
        return this.tweetRepository.findTweetsByUserUsernameIn(followedUsernames, pageable);
    }
}
