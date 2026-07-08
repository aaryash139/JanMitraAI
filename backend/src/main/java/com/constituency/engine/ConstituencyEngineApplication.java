package com.constituency.engine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ConstituencyEngineApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConstituencyEngineApplication.class, args);
	}

}
