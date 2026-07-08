package com.constituency.engine.service;

import com.constituency.engine.model.Notification;
import com.constituency.engine.model.Ward;
import com.constituency.engine.repository.ComplaintRepository;
import com.constituency.engine.repository.NotificationRepository;
import com.constituency.engine.repository.WardRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;
    private final WardRepository wardRepository;

    public AlertService(ComplaintRepository complaintRepository, NotificationRepository notificationRepository, WardRepository wardRepository) {
        this.complaintRepository = complaintRepository;
        this.notificationRepository = notificationRepository;
        this.wardRepository = wardRepository;
    }

    // Runs every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void checkForAnomalies() {
        List<Ward> wards = wardRepository.findAll();
        for (Ward ward : wards) {
            long totalComplaints = complaintRepository.countByWardId(ward.getId());
            if (totalComplaints > 20) { // arbitrary threshold for prototype
                String message = "High complaint volume detected in " + ward.getName() + ": " + totalComplaints + " total open issues.";
                
                // Avoid spamming the same alert
                boolean alreadyAlerted = notificationRepository.findAll().stream()
                        .anyMatch(n -> n.getMessage().equals(message) && !n.isRead());
                
                if (!alreadyAlerted) {
                    Notification alert = new Notification(
                            "Anomaly Detected",
                            message,
                            "HIGH"
                    );
                    notificationRepository.save(alert);
                }
            }
        }
    }
}
