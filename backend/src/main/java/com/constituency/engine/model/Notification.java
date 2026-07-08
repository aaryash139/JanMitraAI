package com.constituency.engine.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String message;
    private String severity; // "LOW", "MEDIUM", "HIGH"
    private boolean isRead = false;
    private LocalDateTime timestamp = LocalDateTime.now();

    public Notification() {}

    public Notification(String title, String message, String severity) {
        this.title = title;
        this.message = message;
        this.severity = severity;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getSeverity() { return severity; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setRead(boolean read) { isRead = read; }
}
