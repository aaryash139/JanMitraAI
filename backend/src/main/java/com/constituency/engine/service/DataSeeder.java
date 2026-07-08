package com.constituency.engine.service;

import com.constituency.engine.model.Complaint;
import com.constituency.engine.model.Notification;
import com.constituency.engine.model.Ward;
import com.constituency.engine.repository.ComplaintRepository;
import com.constituency.engine.repository.NotificationRepository;
import com.constituency.engine.repository.RecommendationRepository;
import com.constituency.engine.repository.WardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final WardRepository wardRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;
    private final RecommendationRepository recommendationRepository;

    public DataSeeder(WardRepository wardRepository, ComplaintRepository complaintRepository, NotificationRepository notificationRepository, RecommendationRepository recommendationRepository) {
        this.wardRepository = wardRepository;
        this.complaintRepository = complaintRepository;
        this.notificationRepository = notificationRepository;
        this.recommendationRepository = recommendationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🌱 Wiping Old Data & Seeding FRESH Demo Data for Hackathon Prototype...");

        // Wipe old data in correct order to respect foreign keys
        notificationRepository.deleteAll();
        complaintRepository.deleteAll();
        recommendationRepository.deleteAll();
        wardRepository.deleteAll();

        // 1. Create Wards
        Ward w1 = new Ward(); w1.setName("Ward 1 - TT Nagar"); w1.setPopulation(120500); w1.setNumSchools(15); w1.setNumHospitals(3); w1.setRoadConnectivityIndex(8.5); w1.setAllocatedBudget(new BigDecimal("5000000"));
        w1.setLiteracyRate(82.4); w1.setWaterSupplyCoverage(95.0); w1.setEmploymentRate(88.5); w1.setPrimaryHealthCenters(4);
        
        Ward w2 = new Ward(); w2.setName("Ward 2 - MP Nagar"); w2.setPopulation(95000); w2.setNumSchools(10); w2.setNumHospitals(5); w2.setRoadConnectivityIndex(9.0); w2.setAllocatedBudget(new BigDecimal("7500000"));
        w2.setLiteracyRate(85.1); w2.setWaterSupplyCoverage(98.2); w2.setEmploymentRate(91.0); w2.setPrimaryHealthCenters(3);
        
        Ward w3 = new Ward(); w3.setName("Ward 3 - Kolar"); w3.setPopulation(210000); w3.setNumSchools(22); w3.setNumHospitals(2); w3.setRoadConnectivityIndex(4.2); w3.setAllocatedBudget(new BigDecimal("3000000")); // Low infrastructure
        w3.setLiteracyRate(68.5); w3.setWaterSupplyCoverage(45.5); w3.setEmploymentRate(62.4); w3.setPrimaryHealthCenters(1);
        
        Ward w4 = new Ward(); w4.setName("Ward 4 - Bairagarh"); w4.setPopulation(85000); w4.setNumSchools(8); w4.setNumHospitals(1); w4.setRoadConnectivityIndex(5.5); w4.setAllocatedBudget(new BigDecimal("2000000"));
        w4.setLiteracyRate(72.0); w4.setWaterSupplyCoverage(60.0); w4.setEmploymentRate(70.5); w4.setPrimaryHealthCenters(2);
        
        wardRepository.saveAll(Arrays.asList(w1, w2, w3, w4));

            // 2. Create Complaints (Tickets)
            createComplaint("Road is completely broken near Kolar junction, water logging every day.", "Infrastructure", "Jan Sunwai Portal", w3);
            createComplaint("No drinking water supply since 3 days in MP Nagar Zone 2.", "Water & Sanitation", "WhatsApp", w2);
            createComplaint("Street lights are not working on VIP road.", "Electricity", "Twitter", w1);
            createComplaint("Garbage truck has not visited our colony for a week.", "Waste Management", "WhatsApp", w3);
            createComplaint("There is a massive pothole causing accidents near the main market.", "Infrastructure", "Twitter", w4);
            createComplaint("Need a new primary school building, current one is collapsing.", "Education", "Jan Sunwai Portal", w3);
            createComplaint("Hospital lacks basic medicines.", "Healthcare", "WhatsApp", w4);
            createComplaint("Traffic signals are down, causing huge jams.", "Infrastructure", "Twitter", w2);
            createComplaint("Stray dogs are attacking children near the park.", "Animal Control", "Jan Sunwai Portal", w1);
            createComplaint("Drainage is choked and dirty water is entering houses.", "Water & Sanitation", "WhatsApp", w3);
            createComplaint("Illegal construction blocking the public road.", "Urban Planning", "Twitter", w1);
            createComplaint("No electricity for the past 12 hours.", "Electricity", "Jan Sunwai Portal", w4);

            // 3. Create Notifications
            notificationRepository.save(new Notification("⚠️ High Volume Alert", "Anomalous spike in 'Infrastructure' complaints detected in Ward 3 (Kolar).", "HIGH"));
            notificationRepository.save(new Notification("📈 Insight Generated", "AI recommends immediate road repair allocation for Ward 3 to prevent monsoon crises.", "MEDIUM"));
            notificationRepository.save(new Notification("✅ System Status", "WhatsApp Bot Integration is online and processing messages.", "LOW"));

            System.out.println("✅ Demo Data Seeded Successfully!");
    }

    private void createComplaint(String text, String category, String channel, Ward ward) {
        Complaint c = new Complaint();
        c.setRawText(text);
        c.setCategory(category);
        c.setSourceChannel(channel);
        c.setWard(ward);
        
        // Auto-assign departments based on category
        if (category.equals("Infrastructure")) c.setAssignedDepartment("Public Works Department (PWD)");
        else if (category.equals("Water & Sanitation")) c.setAssignedDepartment("Municipal Corporation (Water Dept)");
        else if (category.equals("Electricity")) c.setAssignedDepartment("State Electricity Board");
        else if (category.equals("Healthcare")) c.setAssignedDepartment("Health Ministry");
        else c.setAssignedDepartment("General Administration");

        c.setSemanticSummary(text); // For demo, summary is the same
        complaintRepository.save(c);
    }
}
