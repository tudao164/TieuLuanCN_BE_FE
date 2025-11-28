package com.example.rapphim.rapphim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RapphimApplication {

	public static void main(String[] args) {
		SpringApplication.run(RapphimApplication.class, args);
	}
}
