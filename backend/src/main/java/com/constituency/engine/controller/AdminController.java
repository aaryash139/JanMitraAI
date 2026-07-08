package com.constituency.engine.controller;

import com.constituency.engine.model.Ward;
import com.constituency.engine.repository.WardRepository;
import com.opencsv.CSVReader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final WardRepository wardRepository;

    public AdminController(WardRepository wardRepository) {
        this.wardRepository = wardRepository;
    }

    @PostMapping("/ward-data/upload")
    public ResponseEntity<String> uploadWardData(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a CSV file to upload.");
        }

        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {

            List<String[]> records = csvReader.readAll();
            // Assuming CSV format: name,population,numSchools,numHospitals,roadConnectivityIndex,allocatedBudget
            // Skip header if present (checking if first row first column is "name")
            boolean isFirstRow = true;

            for (String[] record : records) {
                if (isFirstRow && record[0].equalsIgnoreCase("name")) {
                    isFirstRow = false;
                    continue;
                }

                String wardName = record[0];
                Optional<Ward> optionalWard = wardRepository.findAll().stream().filter(w -> w.getName().equalsIgnoreCase(wardName)).findFirst();
                
                Ward ward = optionalWard.orElse(new Ward());
                ward.setName(wardName);
                ward.setPopulation(Integer.parseInt(record[1]));
                ward.setNumSchools(Integer.parseInt(record[2]));
                ward.setNumHospitals(Integer.parseInt(record[3]));
                ward.setRoadConnectivityIndex(Double.parseDouble(record[4]));
                ward.setAllocatedBudget(new BigDecimal(record[5]));
                
                wardRepository.save(ward);
            }

            return ResponseEntity.ok("Ward data successfully updated from CSV.");
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Error processing CSV: " + ex.getMessage());
        }
    }
}
