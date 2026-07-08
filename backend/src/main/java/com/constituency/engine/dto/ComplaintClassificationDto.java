package com.constituency.engine.dto;

public class ComplaintClassificationDto {
    private String category;
    private String ward;
    private String sentiment;
    private String severity;
    private String semanticSummary;
    private String aiReply;
    private String assignedDepartment;

    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getSemanticSummary() { return semanticSummary; }
    public void setSemanticSummary(String semanticSummary) { this.semanticSummary = semanticSummary; }

    public String getAiReply() { return aiReply; }
    public void setAiReply(String aiReply) { this.aiReply = aiReply; }

    public String getAssignedDepartment() { return assignedDepartment; }
    public void setAssignedDepartment(String assignedDepartment) { this.assignedDepartment = assignedDepartment; }
}
