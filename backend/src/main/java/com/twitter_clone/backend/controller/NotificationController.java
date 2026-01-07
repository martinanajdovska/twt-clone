package com.twitter_clone.backend.controller;
import com.twitter_clone.backend.model.Notification;
import com.twitter_clone.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/api/notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(notificationService.findAllByRecipient(userDetails.getUsername()));
    }

    @PatchMapping("/api/notifications/{id}")
    public ResponseEntity<Void> readNotification(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        this.notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}