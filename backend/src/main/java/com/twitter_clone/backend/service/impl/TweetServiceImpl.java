package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.config.ModelMapperConfig;
import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.exceptions.ActionNotAllowedException;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.repository.TweetRepository;
import com.twitter_clone.backend.repository.UserRepository;
import com.twitter_clone.backend.service.FollowService;
import com.twitter_clone.backend.service.TweetService;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TweetServiceImpl implements TweetService {
    private final TweetRepository tweetRepository;
    private final UserRepository userRepository;
    private final FollowService followService;
    private final ModelMapper modelMapper;

    public TweetServiceImpl(TweetRepository tweetRepository, UserRepository userRepository, FollowService followService, ModelMapper modelMapper) {
        this.tweetRepository = tweetRepository;
        this.userRepository = userRepository;
        this.followService = followService;
        this.modelMapper = modelMapper;
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

//    TODO: dont return all replies so it doesnt crash if there are many replies
    @Override
    public Page<Tweet> generateFeed(String username, Pageable pageable) {
        User user = this.userRepository.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        List<Long> followedIds = this.followService.followedIds(username);

        return tweetRepository.findTweetsByUserIdIn(followedIds, pageable);
    }

    @Override
    public TweetResponseDTO convertToDTO(Tweet tweet) {
        return this.modelMapper.map(tweet, TweetResponseDTO.class);
    }

    @Override
    public void deleteById(Long id, String username) {
        Tweet tweet = this.tweetRepository.findById(id).orElseThrow(() -> new TweetNotFoundException(id));
        User user = this.userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
        if (!tweet.getUser().getUsername().equals(username)) {
            throw new ActionNotAllowedException("Can't delete another user's tweet");
        }

        this.tweetRepository.delete(tweet);
    }
}
