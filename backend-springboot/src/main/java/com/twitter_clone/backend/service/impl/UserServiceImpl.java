package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.DTO.UserResponseDTO;
import com.twitter_clone.backend.model.DTO.UsernameAndProfilePictureDTO;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.enums.Role;
import com.twitter_clone.backend.model.exceptions.EmailAlreadyExistsException;
import com.twitter_clone.backend.model.exceptions.UsernameAlreadyExistsException;
import com.twitter_clone.backend.repository.UserRepository;
import com.twitter_clone.backend.service.CloudinaryService;
import com.twitter_clone.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final CloudinaryService cloudinaryService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, ModelMapper modelMapper, CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public User register(String username, String password, Role role, String email) {
        if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
            throw new IllegalArgumentException("Must fill both username and password");
        }

        if (this.existsByUsername(username)) {
            throw new UsernameAlreadyExistsException(username);
        }

        if (this.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User(username, hashedPassword, role, email);

        return this.userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return this.userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByUsernameAndPassword(String username, String password) {
        return this.userRepository.findByUsernameAndPassword(username, password);
    }

    @Override
    public boolean existsByUsername(String username) {
        return this.userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return this.userRepository.existsByEmail(email);
    }

    @Override
    public List<String> findByUsernameContaining(String username) {
        return this.userRepository.findAllByUsernameContaining(username);
    }

    @Override
    public void updateProfileImage(String username, MultipartFile file) {
        User user = this.userRepository.findByUsername(username).orElseThrow(()->new UsernameNotFoundException(username));
        String imageUrl = null;
        if (file!=null && !file.isEmpty()) {
            imageUrl = this.cloudinaryService.uploadFile(file, "profile_pictures");
        }
        user.setImageUrl(imageUrl);
        this.userRepository.save(user);
    }

    @Override
    public UsernameAndProfilePictureDTO getUsernameAndProfilePicture(String username) {
        User user = this.userRepository.findByUsername(username).orElseThrow(()->new UsernameNotFoundException(username));
        UsernameAndProfilePictureDTO usernameAndProfilePictureDTO = new UsernameAndProfilePictureDTO();
        usernameAndProfilePictureDTO.setUsername(username);
        usernameAndProfilePictureDTO.setProfilePicture(user.getImageUrl());
        return usernameAndProfilePictureDTO;
    }

    @Override
    public UserResponseDTO convertToDTO(User user) {
        return this.modelMapper.map(user, UserResponseDTO.class);
    }
}
