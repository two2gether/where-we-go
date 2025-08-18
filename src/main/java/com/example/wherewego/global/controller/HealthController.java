package com.example.wherewego.global.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(HttpServletRequest request) {
        String clientIp = getClientIp(request);
        log.info("Health check requested from IP: {}, User-Agent: {}", 
                clientIp, request.getHeader("User-Agent"));
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "where-we-go");
        health.put("version", "1.0.1");
        health.put("clientIp", clientIp);
        health.put("environment", System.getProperty("spring.profiles.active", "default"));
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/actuator/health")
    public ResponseEntity<Map<String, Object>> actuatorHealth(HttpServletRequest request) {
        String clientIp = getClientIp(request);
        log.info("Actuator health check requested from IP: {}, User-Agent: {}", 
                clientIp, request.getHeader("User-Agent"));
        return health(request);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> apiHealth(HttpServletRequest request) {
        String clientIp = getClientIp(request);
        log.info("API health check requested from IP: {}, User-Agent: {}", 
                clientIp, request.getHeader("User-Agent"));
        return health(request);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}