package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.repository.TweetRepository;
import com.twitter_clone.backend.repository.UserRepository;
import com.twitter_clone.backend.service.TweetService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TweetServiceImpl implements TweetService {
    private final TweetRepository tweetRepository;
    private final UserRepository userRepository;

    public TweetServiceImpl(TweetRepository tweetRepository, UserRepository userRepository) {
        this.tweetRepository = tweetRepository;
        this.userRepository = userRepository;
    }
//    TODO: image handling

    //    TODO: check if content length >=255 and disable submitting on frontend
    public Optional<Tweet> save(String username, Long parentId, String content, String imageUrl) {
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Can't post empty tweet");
        }

        User user = this.userRepository.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        Tweet parentTweet = null;
        if (parentId != null) {
            parentTweet = this.tweetRepository.findById(parentId).orElseThrow(()-> new TweetNotFoundException(parentId));
        }

        return Optional.of(this.tweetRepository.save(new Tweet(user, parentTweet, content, imageUrl)));
    }

    public List<Tweet> findAllByUserUsername(String username) {
        return this.tweetRepository.findAllByUserUsername(username);
    }

    @Override
    public Optional<Tweet> findById(Long id) {
        return this.tweetRepository.findById(id);
    }
}
