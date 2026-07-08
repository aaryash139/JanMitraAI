package com.constituency.engine.service;

import com.constituency.engine.model.Ward;
import com.constituency.engine.repository.ComplaintRepository;
import com.constituency.engine.repository.WardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsightQueryService {

    private final GeminiClientService geminiClientService;
    private final WardRepository wardRepository;
    private final ComplaintRepository complaintRepository;

    public InsightQueryService(GeminiClientService geminiClientService, WardRepository wardRepository, ComplaintRepository complaintRepository) {
        this.geminiClientService = geminiClientService;
        this.wardRepository = wardRepository;
        this.complaintRepository = complaintRepository;
    }

    public String generateInsight(String userQuery) {
        // Fetch context for AI
        List<Ward> wards = wardRepository.findAll();
        StringBuilder context = new StringBuilder("Constituency Data Context:\n");
        for (Ward ward : wards) {
            long complaintCount = complaintRepository.countByWardId(ward.getId());
            context.append(String.format("Ward: %s, Population: %d, Open Complaints: %d. ", 
                ward.getName(), ward.getPopulation(), complaintCount));
        }

        String prompt = "You are an AI assistant for an MP (Member of Parliament). Use the provided context to answer their question directly and concisely.\n\n"
                + context.toString() + "\n\nQuestion: " + userQuery;

        try {
            return geminiClientService.callGeminiForText(prompt);
        } catch (Exception e) {
            return "Sorry, I am unable to analyze the data right now. Please ensure my API key is configured.";
        }
    }
}
