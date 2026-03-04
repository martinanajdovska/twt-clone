package com.twitter_clone.backend.service;

import com.twitter_clone.backend.model.Notification;
import com.twitter_clone.backend.model.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void createNotification(String to, String from, String msg, String link, NotificationType type);
    List<Notification> findAllByRecipient(String username);
    void markAsRead(Long id);
}
