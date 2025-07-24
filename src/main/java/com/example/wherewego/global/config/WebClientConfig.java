package com.example.wherewego.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class WebClientConfig {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;
    
    @Value("${google.api.key}")
    private String googleApiKey;

    @Bean
    public WebClient kakaoWebClient() {
        // API 키 로딩 확인을 위한 로깅
        log.info("카카오 API 키 로딩 확인 - 키 존재 여부: {}, 키 길이: {}", 
                kakaoApiKey != null, kakaoApiKey != null ? kakaoApiKey.length() : 0);
        
        if (kakaoApiKey == null || kakaoApiKey.trim().isEmpty()) {
            log.error("카카오 API 키가 설정되지 않았습니다!");
            throw new IllegalStateException("카카오 API 키가 필요합니다");
        }
        
        String authHeader = "KakaoAK " + kakaoApiKey;
        log.debug("Authorization 헤더 설정: {}", authHeader.substring(0, Math.min(20, authHeader.length())) + "...");
        
        return WebClient.builder()
                .baseUrl("https://dapi.kakao.com")
                .defaultHeader("Authorization", authHeader)
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(2 * 1024 * 1024))
                .build();
    }
    
    @Bean
    public WebClient googleWebClient() {
        // API 키 로딩 확인을 위한 로깅
        log.info("구글 API 키 로딩 확인 - 키 존재 여부: {}, 키 길이: {}", 
                googleApiKey != null, googleApiKey != null ? googleApiKey.length() : 0);
        
        if (googleApiKey == null || googleApiKey.trim().isEmpty()) {
            log.error("구글 Maps API 키가 설정되지 않았습니다!");
            throw new IllegalStateException("구글 Maps API 키가 필요합니다");
        }
        
        log.debug("구글 API 키 설정 완료: {}...{}", 
                googleApiKey.substring(0, Math.min(6, googleApiKey.length())),
                googleApiKey.length() > 6 ? googleApiKey.substring(googleApiKey.length() - 4) : "");
        
        return WebClient.builder()
                .baseUrl("https://maps.googleapis.com/maps/api/place")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(2 * 1024 * 1024))
                .build();
    }
}