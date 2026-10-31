package com.company.email;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EmailApplication {

    static void main(String[] args) {
        SpringApplication.run(EmailApplication.class, args);
    }
}