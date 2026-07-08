package com.constituency.engine.service;

import com.constituency.engine.dto.ComplaintClassificationDto;
import com.constituency.engine.model.Complaint;
import com.constituency.engine.model.Ward;
import com.constituency.engine.repository.ComplaintRepository;
import com.constituency.engine.repository.WardRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

    private static final Logger logger = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepository;
    private final WardRepository wardRepository;
    private final GeminiClientService geminiClientService;

    public ComplaintService(ComplaintRepository complaintRepository, WardRepository wardRepository, GeminiClientService geminiClientService) {
        this.complaintRepository = complaintRepository;
        this.wardRepository = wardRepository;
        this.geminiClientService = geminiClientService;
    }

    public Complaint ingestComplaint(String rawText, String sourceChannel, String citizenName, String citizenPhone, String manualDepartment, Long manualWardId) {
        Complaint complaint = new Complaint();
        complaint.setRawText(rawText);
        complaint.setSourceChannel(sourceChannel);
        complaint.setCitizenName(citizenName);
        complaint.setCitizenPhone(citizenPhone);
        
        try {
            // Translate if necessary (For prototype, assuming translation is handled in the same prompt)
            String prompt = buildClassificationPrompt(rawText, citizenName);
            ComplaintClassificationDto classification;
            
            try {
                classification = geminiClientService.callGeminiForStructuredOutput(prompt, ComplaintClassificationDto.class);
            } catch (Exception e) {
                logger.warn("Gemini AI API Failed. Engaging Offline Fallback Mock AI...", e);
                classification = generateFallbackClassification(rawText);
            }
            
            complaint.setCategory(classification.getCategory() != null ? classification.getCategory() : "Uncategorized");
            complaint.setSentiment(classification.getSentiment());
            complaint.setSeverity(classification.getSeverity());
            complaint.setSemanticSummary(classification.getSemanticSummary());
            complaint.setAiReply(classification.getAiReply());
            
            if (manualDepartment != null && !manualDepartment.trim().isEmpty()) {
                complaint.setAssignedDepartment(manualDepartment + " (User Selected)");
            } else {
                complaint.setAssignedDepartment(classification.getAssignedDepartment() != null ? classification.getAssignedDepartment() : "General Administration");
            }
            
            // Try to find the ward
            if (manualWardId != null) {
                wardRepository.findById(manualWardId).ifPresent(complaint::setWard);
            } else if (classification.getWard() != null) {
                // simple substring match for prototype, ideally should be robust
                List<Ward> wards = wardRepository.findAll();
                final String classificationWard = classification.getWard();
                Ward matchedWard = wards.stream()
                        .filter(w -> w.getName().toLowerCase().contains(classificationWard.toLowerCase()))
                        .findFirst()
                        .orElse(null);
                complaint.setWard(matchedWard);
            }

            // Clustering Logic: Find similar complaints in the same ward and category
            if (complaint.getWard() != null && complaint.getCategory() != null) {
                List<Complaint> existingComplaints = complaintRepository.findByWardId(complaint.getWard().getId());
                
                String clusterId = existingComplaints.stream()
                        .filter(c -> complaint.getCategory().equals(c.getCategory()))
                        // For prototype, simple semantic matching based on category is used. 
                        // In production, we'd use embeddings or ask Gemini to group them.
                        .map(Complaint::getClusterId)
                        .findFirst()
                        .orElse(java.util.UUID.randomUUID().toString());
                
                complaint.setClusterId(clusterId);
            } else {
                complaint.setClusterId(java.util.UUID.randomUUID().toString());
            }

        } catch (Exception e) {
            logger.error("AI Classification failed for complaint. Saving raw text.", e);
            complaint.setCategory("AI_PROCESSING_FAILED");
        }

        return complaintRepository.save(complaint);
    }

    private String buildClassificationPrompt(String rawText, String citizenName) {
        String nameStr = (citizenName != null && !citizenName.isEmpty()) ? citizenName : "Citizen";
        return "Analyze the following citizen complaint and output a JSON object.\n" +
               "Complaint: \"" + rawText + "\"\n" +
               "Citizen Name: \"" + nameStr + "\"\n\n" +
               "Extract the following fields:\n" +
               "- category: (Must be one of: Road Infrastructure, Water Supply, Education, Health, Electricity, Sanitation, Uncategorized)\n" +
               "- ward: (Extract the ward name or location if present, else return null)\n" +
               "- sentiment: (positive, neutral, negative)\n" +
               "- severity: (low, medium, high)\n" +
               "- semanticSummary: (A one-line normalized English restatement of the issue)\n" +
               "- assignedDepartment: (Auto-assign to a specific Govt Dept based on category, e.g. 'PWD', 'Jal Board', 'Electricity Dept')\n" +
               "- aiReply: (Generate an empathetic 1-2 sentence response directly to the citizen in their original language. Tell them we have received their complaint and auto-routed it to the relevant department.)";
    }

    private ComplaintClassificationDto generateFallbackClassification(String rawText) {
        ComplaintClassificationDto dto = new ComplaintClassificationDto();
        String text = rawText.toLowerCase();
        
        if (text.contains("water") || text.contains("paani") || text.contains("leak")) {
            dto.setCategory("Water Supply");
            dto.setAssignedDepartment("Municipal Corporation (Water Dept)");
        } else if (text.contains("road") || text.contains("sadak") || text.contains("pothole")) {
            dto.setCategory("Infrastructure");
            dto.setAssignedDepartment("Public Works Department (PWD)");
        } else if (text.contains("light") || text.contains("electricity") || text.contains("bijli")) {
            dto.setCategory("Electricity");
            dto.setAssignedDepartment("State Electricity Board");
        } else {
            dto.setCategory("General Services");
            dto.setAssignedDepartment("General Administration");
        }
        
        dto.setSentiment("negative");
        dto.setSeverity(text.contains("urgent") || text.contains("emergency") ? "high" : "medium");
        dto.setSemanticSummary("Fallback AI summary: " + rawText.substring(0, Math.min(rawText.length(), 50)) + "...");
        dto.setAiReply("We have received your complaint and auto-routed it via our Offline Fallback System. It is being processed.");
        
        return dto;
    }
}
