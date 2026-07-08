package com.constituency.engine.controller;

import com.constituency.engine.model.Complaint;
import com.constituency.engine.service.ComplaintService;
import com.constituency.engine.service.SpeechToTextService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*") // For prototype, allow all origins
public class ComplaintController {

    private final ComplaintService complaintService;
    private final SpeechToTextService speechToTextService;

    public ComplaintController(ComplaintService complaintService, SpeechToTextService speechToTextService) {
        this.complaintService = complaintService;
        this.speechToTextService = speechToTextService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<Complaint> ingestComplaint(@RequestBody Map<String, String> payload) {
        String rawText = payload.get("rawText");
        String channel = payload.getOrDefault("sourceChannel", "Web Form");
        String citizenName = payload.get("citizenName");
        String citizenPhone = payload.get("citizenPhone");
        String manualDepartment = payload.get("manualDepartment");
        String wardIdStr = payload.get("wardId");
        Long wardId = null;
        if (wardIdStr != null && !wardIdStr.trim().isEmpty()) {
            try { wardId = Long.parseLong(wardIdStr); } catch (Exception ignored) {}
        }
        
        if (rawText == null || rawText.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Complaint processedComplaint = complaintService.ingestComplaint(rawText, channel, citizenName, citizenPhone, manualDepartment, wardId);
        return ResponseEntity.ok(processedComplaint);
    }
    
    @PostMapping("/ingest/audio")
    public ResponseEntity<Complaint> ingestAudioComplaint(
            @RequestParam("audio") MultipartFile audio, 
            @RequestParam("channel") String channel,
            @RequestParam(value = "citizenName", required = false) String citizenName,
            @RequestParam(value = "citizenPhone", required = false) String citizenPhone,
            @RequestParam(value = "manualDepartment", required = false) String manualDepartment,
            @RequestParam(value = "wardId", required = false) Long wardId) {
        try {
            String transcribedText = speechToTextService.transcribeAudio(audio);
            Complaint processedComplaint = complaintService.ingestComplaint(transcribedText, channel, citizenName, citizenPhone, manualDepartment, wardId);
            return ResponseEntity.ok(processedComplaint);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
