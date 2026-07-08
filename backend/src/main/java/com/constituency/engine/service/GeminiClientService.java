package com.constituency.engine.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiClientService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiClientService.class);
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${gemini.api.key:mock_key}")
    private String apiKey;

    public GeminiClientService() {
        this.webClient = WebClient.builder().baseUrl("https://generativelanguage.googleapis.com").build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Calls Gemini API with structured JSON output enabled.
     * Implements Module 9a reliability requirements.
     */
    public <T> T callGeminiForStructuredOutput(String prompt, Class<T> responseClass) {
        Map<String, Object> requestBody = buildGeminiRequest(prompt, "application/json", 0.0);
        
        try {
            String rawResponse = webClient.post()
                    .uri("/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(15))
                    .retry(1)
                    .block();
                    
            return parseGeminiResponse(rawResponse, responseClass);
        } catch (Exception e) {
            logger.error("Failed to process Gemini API call or parse response. Error: {}", e.getMessage(), e);
            throw new RuntimeException("Gemini Processing Failed", e);
        }
    }
    
    /**
     * Calls Gemini API for natural language text (e.g. justifications).
     */
    public String callGeminiForText(String prompt) {
        Map<String, Object> requestBody = buildGeminiRequest(prompt, "text/plain", 0.7);
        
        try {
            String rawResponse = webClient.post()
                    .uri("/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(15))
                    .retry(1)
                    .block();
                    
            return extractTextFromResponse(rawResponse);
        } catch (Exception e) {
            logger.error("Failed to generate text from Gemini API. Error: {}", e.getMessage(), e);
            return "Recommendation generated automatically based on weighted impact scoring metrics.";
        }
    }

    private Map<String, Object> buildGeminiRequest(String prompt, String mimeType, double temperature) {
        Map<String, Object> request = new HashMap<>();
        
        // Parts
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        request.put("contents", List.of(content));
        
        // Generation Config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", mimeType);
        generationConfig.put("temperature", temperature);
        request.put("generationConfig", generationConfig);
        
        return request;
    }

    private <T> T parseGeminiResponse(String rawResponse, Class<T> responseClass) throws JsonProcessingException {
        String textOutput = extractTextFromResponse(rawResponse);
        
        // Clean markdown fences if any are returned despite schema
        textOutput = textOutput.trim().replaceAll("^```json|^```|```$", "").trim();
        
        // Extract substring between first { and last }
        int firstBrace = textOutput.indexOf('{');
        int lastBrace = textOutput.lastIndexOf('}');
        
        if (firstBrace != -1 && lastBrace != -1) {
            textOutput = textOutput.substring(firstBrace, lastBrace + 1);
        }
        
        return objectMapper.readValue(textOutput, responseClass);
    }
    
    private String extractTextFromResponse(String rawResponse) throws JsonProcessingException {
        // Extracting from standard Gemini JSON response format
        Map<String, Object> responseMap = objectMapper.readValue(rawResponse, Map.class);
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts != null && !parts.isEmpty()) {
                return (String) parts.get(0).get("text");
            }
        }
        throw new RuntimeException("Unexpected response format from Gemini: " + rawResponse);
    }
}
