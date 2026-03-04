package com.twitter_clone.backend.model;

import com.twitter_clone.backend.model.enums.NotificationType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipient;
    private String actor;
    private String message;
    private String link;
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private NotificationType type;

    public Notification(Long id, String recipient, String actor, String message, String link, boolean isRead, LocalDateTime createdAt, NotificationType type) {
        this.id = id;
        this.recipient = recipient;
        this.actor = actor;
        this.message = message;
        this.link = link;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.type = type;
    }
}
