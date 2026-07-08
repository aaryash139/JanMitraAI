package com.constituency.engine.controller;

import com.constituency.engine.service.InsightQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    private final InsightQueryService insightQueryService;

    public InsightController(InsightQueryService insightQueryService) {
        this.insightQueryService = insightQueryService;
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, String>> askAi(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("answer", "Query cannot be empty."));
        }
        
        String answer = insightQueryService.generateInsight(query);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
