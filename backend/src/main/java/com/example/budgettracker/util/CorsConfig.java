package com.example.budgettracker.util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// This file deals with browsers security feature called Same-Origin Policy
// even though I am using both localhost:3000 and 8080, both use a different port
// so the browser considers them different origins which is why I get CORS (Cross-Origin Resource Sharing) errors

// @: tells spring boot that this calls contains configurations instructions for the app
@Configuration
public class CorsConfig {

    
    @Bean
    public WebMvcConfigurer corsConfigurer() {

        //Creating an anonymous class. Creates an implementation of WebMvcConfigurer
        // without giving that implementation its own class name.
        return new WebMvcConfigurer() {

            @Override
            //CorsRegistry object allows you register your own CORS rules
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        //tells spring that requests from localhost:3000 are allowed
                        .allowedOrigins("http://localhost:3000")
                        //OPTIONS is a preflight request that checks with the browser to see if these requests are allowed
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        //Content-Type tells spring to allow JSON data
                        //Authorization is used to send authentication information like tokens
                        .allowedHeaders("Content-Type", "Authorization");
            }
        };
    }
}