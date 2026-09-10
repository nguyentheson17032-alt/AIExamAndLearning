package com.aiexam.learning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ExamWarehouseApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamWarehouseApplication.class, args);
    }
}
