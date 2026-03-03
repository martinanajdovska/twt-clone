package com.twitter_clone.backend.service.impl;

import com.twitter_clone.backend.model.Notification;
import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.model.enums.NotificationType;
import com.twitter_clone.backend.model.exceptions.NotificationNotFoundException;
import com.twitter_clone.backend.model.exceptions.UsernameNotFoundException;
import com.twitter_clone.backend.repository.NotificationRepository;
import com.twitter_clone.backend.service.NotificationService;
import com.twitter_clone.backend.service.UserService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationServiceImpl(SimpMessagingTemplate messagingTemplate, NotificationRepository notificationRepository, UserService userService) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    @Transactional
    public void createNotification(String to, String from, String msg, String link, NotificationType type) {
        Notification notification = new Notification();
        notification.setRecipient(to);
        notification.setActor(from);
        notification.setMessage(msg);
        notification.setLink(link);
        notification.setType(type);

        this.notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(to, "/queue/notifications", notification);
    }

    @Override
    public List<Notification> findAllByRecipient(String username) {
        User user = this.userService.findByUsername(username).orElseThrow(()-> new UsernameNotFoundException(username));

        return this.notificationRepository.findAllByRecipientOrderByCreatedAtDesc(username);
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = this.notificationRepository.findById(id).orElseThrow(()-> new NotificationNotFoundException(id));
        notification.setRead(true);
        this.notificationRepository.save(notification);
    }
}
