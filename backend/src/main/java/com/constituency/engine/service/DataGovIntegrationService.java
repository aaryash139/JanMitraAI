package com.constituency.engine.service;

import com.constituency.engine.model.Ward;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class DataGovIntegrationService {

    private final Random random = new Random(42); // Seeded for consistent mock data

    public List<Ward> fetchMockWardData() {
        List<Ward> wards = new ArrayList<>();
        String[] zones = {"North", "South", "East", "West", "Central"};
        String[] areas = {"Vihar", "Nagar", "Enclave", "Kunj", "Colony"};

        for (int i = 1; i <= 20; i++) {
            Ward ward = new Ward();
            
            if (i == 15) {
                // THE GOLDEN PATH WARD (Crisis Ward for Hackathon Demo)
                ward.setName("Ward 15 - North Vihar (Crisis Zone)");
                ward.setPopulation(185000); // Very dense
                ward.setNumSchools(3);
                ward.setNumHospitals(1);
                ward.setRoadConnectivityIndex(4.1);
                ward.setLiteracyRate(62.4);
                ward.setWaterSupplyCoverage(32.5); // CRITICALLY LOW water coverage
                ward.setEmploymentRate(65.0);
                ward.setPrimaryHealthCenters(1);
                ward.setActiveSchemes("Jal Jeevan Mission (Pending)");
                ward.setAllocatedBudget(new BigDecimal("15000000.00"));
            } else {
                String zone = zones[random.nextInt(zones.length)];
                String area = areas[random.nextInt(areas.length)];
                ward.setName("Ward " + i + " - " + zone + " " + area);
                
                // Generate realistic demographic and infrastructure data
                int pop = 50000 + random.nextInt(150000);
                ward.setPopulation(pop);
                
                ward.setNumSchools(2 + random.nextInt(10));
                ward.setNumHospitals(random.nextInt(5));
                ward.setRoadConnectivityIndex(3.0 + (random.nextDouble() * 6.5)); // 3.0 to 9.5
                
                // New data.gov.in fields
                ward.setLiteracyRate(65.0 + (random.nextDouble() * 30.0)); // 65% to 95%
                ward.setWaterSupplyCoverage(60.0 + (random.nextDouble() * 35.0)); // 60% to 95%
                ward.setEmploymentRate(70.0 + (random.nextDouble() * 25.0)); // 70% to 95%
                ward.setPrimaryHealthCenters(1 + random.nextInt(4));
                
                ward.setActiveSchemes(generateMockSchemes());
                ward.setAllocatedBudget(new BigDecimal(10000000 + random.nextInt(90000000) + ".00"));
            }
            
            wards.add(ward);
        }
        
        return wards;
    }

    private String generateMockSchemes() {
        String[] schemes = {"Swachh Bharat", "PMGSY", "Smart City", "Jal Jeevan Mission", "Ayushman Bharat"};
        int count = 1 + random.nextInt(3);
        List<String> active = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String s = schemes[random.nextInt(schemes.length)];
            if (!active.contains(s)) active.add(s);
        }
        return String.join(", ", active);
    }
}
