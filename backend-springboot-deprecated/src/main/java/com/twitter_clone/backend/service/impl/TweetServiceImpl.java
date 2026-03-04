package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.TweetResponseDTO;
import com.twitter_clone.backend.model.Tweet;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.enums.NotificationType;
import com.twitter_clone.backend.model.exceptions.TweetNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.repository.TweetRepository;
import com.twitter_clone.backend.service.CloudinaryService;
import com.twitter_clone.backend.service.NotificationService;
import com.twitter_clone.backend.service.TweetService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class TweetServiceImpl implements TweetService {
    private final TweetRepository tweetRepository;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    private final CloudinaryService cloudinaryService;

    public TweetServiceImpl(TweetRepository tweetRepository, UserService userService, ModelMapper modelMapper, NotificationService notificationService, CloudinaryService cloudinaryService) {
        this.tweetRepository = tweetRepository;
        this.userService = userService;
        this.modelMapper = modelMapper;
        this.notificationService = notificationService;
        this.cloudinaryService = cloudinaryService;
    }

    public TweetResponseDTO save(String username, Long parentId, String content, MultipartFile file) {
        if (content.isEmpty() && file.isEmpty()) {
            throw new IllegalArgumentException("Can't post empty tweet");
        }

        if (content.length()>=255) {
            throw new IllegalArgumentException("Can't post tweet longer than 255 characters");
        }

        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));
        Tweet parentTweet = null;
        if (parentId != null) {
            parentTweet = this.tweetRepository.findById(parentId).orElseThrow(()-> new TweetNotFoundException(parentId));
        }

        String imageUrl = null;
        if (file!=null && !file.isEmpty()) {
            imageUrl = this.cloudinaryService.uploadFile(file, "tweet_images");
        }

        Tweet tweet = this.tweetRepository.save(new Tweet(user, parentTweet, content, imageUrl));

        if (parentId != null && !username.equals(parentTweet.getUser().getUsername())) {
            notificationService.createNotification(parentTweet.getUser().getUsername(), username, "replied to your tweet", "/tweets/"+tweet.getId().toString(), NotificationType.REPLY);
        }
        return this.convertToDTO(tweet);
    }

    // used for profile feed
    @Override
    public List<Tweet> findAllParentTweetsByUsername(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));

        return this.tweetRepository.findAllByUserUsernameAndParentTweetIsNull(username);
    }

    // used for general feed
    @Override
    public List<Tweet> findAllParentTweetsByUsernames(List<String> followedUsernames) {
        return this.tweetRepository.findAllByUserUsernameIsInAndParentTweetIsNull(followedUsernames);
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
    @Transactional
    public void deleteById(Long id, String username) {
        Tweet tweet = this.tweetRepository.findById(id).orElseThrow(() -> new TweetNotFoundException(id));
        User user = this.userService.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));

        this.tweetRepository.delete(tweet);
    }

    @Override
    public TweetResponseDTO getTweetById(Long id) {
        Tweet tweet = this.tweetRepository.findById(id).orElseThrow(() -> new TweetNotFoundException(id));

        return this.convertToDTO(tweet);
    }

    @Override
    public List<Tweet> findAllById(List<Long> ids) {
        return this.tweetRepository.findAllByIdIsIn(ids);
    }

    @Override
    public List<Tweet> findAllRepliesOfTweet(Long id, Pageable pageable) {
        Tweet tweet = this.tweetRepository.findById(id).orElseThrow(()->new TweetNotFoundException(id));
        List<Tweet> replies = this.tweetRepository.findAllByParentTweetOrderByCreatedAtDesc(tweet, pageable);

        return replies;
    }
}
