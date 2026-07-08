package com.constituency.engine.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "wards")
public class Ward {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Integer population;
    private Integer numSchools;
    private Integer numHospitals;
    private Double roadConnectivityIndex; // e.g., 0.0 to 10.0
    private String activeSchemes;
    private BigDecimal allocatedBudget;
    
    // New data.gov.in demographic/infrastructure fields
    private Double literacyRate; // e.g. 74.04%
    private Double waterSupplyCoverage; // e.g. 85.5%
    private Double employmentRate; // e.g. 91.2%
    private Integer primaryHealthCenters;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Integer getPopulation() { return population; }
    public void setPopulation(Integer population) { this.population = population; }
    
    public Integer getNumSchools() { return numSchools; }
    public void setNumSchools(Integer numSchools) { this.numSchools = numSchools; }
    
    public Integer getNumHospitals() { return numHospitals; }
    public void setNumHospitals(Integer numHospitals) { this.numHospitals = numHospitals; }
    
    public Double getRoadConnectivityIndex() { return roadConnectivityIndex; }
    public void setRoadConnectivityIndex(Double roadConnectivityIndex) { this.roadConnectivityIndex = roadConnectivityIndex; }
    
    public String getActiveSchemes() { return activeSchemes; }
    public void setActiveSchemes(String activeSchemes) { this.activeSchemes = activeSchemes; }
    
    public BigDecimal getAllocatedBudget() { return allocatedBudget; }
    public void setAllocatedBudget(BigDecimal allocatedBudget) { this.allocatedBudget = allocatedBudget; }
    
    public Double getLiteracyRate() { return literacyRate; }
    public void setLiteracyRate(Double literacyRate) { this.literacyRate = literacyRate; }
    
    public Double getWaterSupplyCoverage() { return waterSupplyCoverage; }
    public void setWaterSupplyCoverage(Double waterSupplyCoverage) { this.waterSupplyCoverage = waterSupplyCoverage; }
    
    public Double getEmploymentRate() { return employmentRate; }
    public void setEmploymentRate(Double employmentRate) { this.employmentRate = employmentRate; }
    
    public Integer getPrimaryHealthCenters() { return primaryHealthCenters; }
    public void setPrimaryHealthCenters(Integer primaryHealthCenters) { this.primaryHealthCenters = primaryHealthCenters; }
}
