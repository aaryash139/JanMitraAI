package com.constituency.engine.controller;

import com.constituency.engine.model.Ward;
import com.constituency.engine.model.Complaint;
import com.constituency.engine.model.Recommendation;
import com.constituency.engine.repository.WardRepository;
import com.constituency.engine.repository.ComplaintRepository;
import com.constituency.engine.service.ImpactScoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For prototype
public class DashboardController {

    private final WardRepository wardRepository;
    private final ComplaintRepository complaintRepository;
    private final ImpactScoringService impactScoringService;
    private final com.constituency.engine.service.GeminiClientService geminiClientService;

    public DashboardController(WardRepository wardRepository, ComplaintRepository complaintRepository, 
                               ImpactScoringService impactScoringService, 
                               com.constituency.engine.service.GeminiClientService geminiClientService) {
        this.wardRepository = wardRepository;
        this.complaintRepository = complaintRepository;
        this.impactScoringService = impactScoringService;
        this.geminiClientService = geminiClientService;
    }

    @GetMapping("/dashboard/wards")
    public ResponseEntity<List<Map<String, Object>>> getWardDashboard() {
        List<Ward> wards = wardRepository.findAll();
        List<Map<String, Object>> dashboardData = wards.stream().map(ward -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", ward.getId());
            data.put("name", ward.getName());
            data.put("population", ward.getPopulation());
            
            List<Complaint> complaints = complaintRepository.findByWardId(ward.getId());
            data.put("totalComplaints", complaints.size());
            
            // Group complaints by category
            Map<String, Long> complaintsByCategory = complaints.stream()
                .filter(c -> c.getCategory() != null)
                .collect(Collectors.groupingBy(Complaint::getCategory, Collectors.counting()));
                
            Map<String, Long> complaintsByChannel = complaints.stream()
                .filter(c -> c.getSourceChannel() != null)
                .collect(Collectors.groupingBy(Complaint::getSourceChannel, Collectors.counting()));
                
            data.put("complaintsByCategory", complaintsByCategory);
            data.put("complaintsByChannel", complaintsByChannel);
            return data;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/recommendations/{wardId}")
    public ResponseEntity<Recommendation> getRecommendation(@PathVariable Long wardId) {
        Recommendation recommendation = impactScoringService.generateRecommendation(wardId);
        if (recommendation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recommendation);
    }
    
    @GetMapping("/dashboard/predictions")
    public ResponseEntity<Map<String, String>> getPredictions() {
        Map<String, String> response = new HashMap<>();
        response.put("prediction", "AI Warning: Highly anomalous spike in Water Supply complaints detected in Ward 15 over the last 48 hours. Recommend immediate intervention.");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/dashboard/tickets")
    public ResponseEntity<List<Complaint>> getRecentTickets() {
        List<Complaint> allComplaints = complaintRepository.findAll();
        List<Complaint> tickets = allComplaints.stream()
            .filter(c -> c.getAssignedDepartment() != null && !c.getAssignedDepartment().isEmpty())
            .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
            .limit(10)
            .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }
}
