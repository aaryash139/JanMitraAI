package com.constituency.engine.service;

import com.constituency.engine.model.Ward;
import com.constituency.engine.model.Complaint;
import com.constituency.engine.repository.WardRepository;
import com.constituency.engine.repository.ComplaintRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    private final WardRepository wardRepository;
    private final ComplaintRepository complaintRepository;
    private final DataGovIntegrationService dataGovIntegrationService;

    public DataLoader(WardRepository wardRepository, ComplaintRepository complaintRepository, DataGovIntegrationService dataGovIntegrationService) {
        this.wardRepository = wardRepository;
        this.complaintRepository = complaintRepository;
        this.dataGovIntegrationService = dataGovIntegrationService;
    }

    @Override
    public void run(String... args) throws Exception {
        if (wardRepository.count() == 0) {
            System.out.println("Fetching mocked Open Government Data (data.gov.in) for wards...");
            var wards = dataGovIntegrationService.fetchMockWardData();
            wardRepository.saveAll(wards);
            
            System.out.println("Injecting golden path complaints for Crisis Ward (Ward 15)...");
            Ward crisisWard = wards.stream().filter(w -> w.getName().contains("Ward 15")).findFirst().orElse(null);
            if (crisisWard != null) {
                for (int i = 0; i < 45; i++) {
                    Complaint c = new Complaint();
                    c.setWard(crisisWard);
                    c.setCategory("Water Supply");
                    c.setRawText("We have not had clean drinking water for days. The pipes are completely broken.");
                    c.setSemanticSummary("Broken pipes causing drinking water shortage.");
                    c.setSeverity("High");
                    c.setSentiment("Negative");
                    c.setAssignedDepartment("Water Board");
                    c.setSourceChannel("WhatsApp");
                    complaintRepository.save(c);
                }
            }
            
            System.out.println("Mock Ward and Complaint data loaded successfully.");
        }
    }
}
