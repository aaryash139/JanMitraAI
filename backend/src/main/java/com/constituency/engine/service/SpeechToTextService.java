package com.constituency.engine.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.Duration;

@Service
public class SpeechToTextService {

    private final WebClient webClient;
    
    @Value("${gemini.api.key:mock_key}")
    private String apiKey;
    
    private final GeminiClientService geminiClientService;

    public SpeechToTextService(GeminiClientService geminiClientService) {
        this.webClient = WebClient.builder().baseUrl("https://generativelanguage.googleapis.com").build();
        this.geminiClientService = geminiClientService;
    }

    public String transcribeAudio(MultipartFile audioFile) throws Exception {
        if ("mock_key".equals(apiKey)) {
            return "Audio transcription simulated. Please configure real API key.";
        }

        String base64Audio = Base64.getEncoder().encodeToString(audioFile.getBytes());
        String mimeType = audioFile.getContentType() != null ? audioFile.getContentType() : "audio/mp3";

        // Construct inlineData for Gemini
        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Audio);

        Map<String, Object> part = new HashMap<>();
        part.put("inlineData", inlineData);
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", "Please carefully transcribe this audio into text. If it is in Hindi, output the Hindi text. If it is English, output English text. Output NOTHING ELSE but the transcribed text.");

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part, textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        String rawResponse = webClient.post()
                .uri("/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(20))
                .block();

        // Use the existing method to extract text
        // (Since it's private in GeminiClientService, we'll parse it here using Jackson manually, 
        // or just rely on a simple string search since it's just text).
        // For simplicity, let's just make it call a generic parser or do simple extraction.
        
        // Simple extraction for prototype
        int start = rawResponse.indexOf("\"text\": \"") + 9;
        int end = rawResponse.indexOf("\"", start);
        if (start > 8 && end > start) {
            String transcribed = rawResponse.substring(start, end);
            return transcribed.replace("\\n", "").replace("\\\"", "\"").trim();
        }
        
        return "Transcription failed";
    }
}
