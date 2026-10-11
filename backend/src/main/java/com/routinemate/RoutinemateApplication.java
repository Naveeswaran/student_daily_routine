package com.routinemate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RoutinemateApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoutinemateApplication.class, args);
    }
}
