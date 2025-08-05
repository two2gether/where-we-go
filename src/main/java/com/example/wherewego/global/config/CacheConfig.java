package com.example.wherewego.global.config;

import java.time.Duration;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 기반 캐싱 설정
 * 
 * Place 시스템의 Google Places API 호출 최적화를 위한 캐싱 설정을 제공합니다.
 * 각 캐시별로 다른 TTL을 적용하여 데이터 특성에 맞는 캐싱 전략을 구현합니다.
 */
@Configuration
@EnableCaching
@Profile("!local") // local 프로필에서는 캐싱 비활성화
public class CacheConfig {

    /**
     * Redis 기반 캐시 매니저 설정
     * 
     * @param redisConnectionFactory Redis 연결 팩토리
     * @return RedisCacheManager 인스턴스
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        // 기본 캐시 설정
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30)) // 기본 TTL: 30분
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues(); // null 값 캐싱 비활성화

        return RedisCacheManager.builder(redisConnectionFactory)
            .cacheDefaults(defaultConfig)
            // Google Places API 캐시 설정
            .withCacheConfiguration("google-place-details", 
                defaultConfig.entryTtl(Duration.ofDays(7))) // Google API 상세정보: 7일 (Google 약관 준수)
            .withCacheConfiguration("google-place-search", 
                defaultConfig.entryTtl(Duration.ofHours(1))) // Google API 검색: 1시간 (빈번한 변경 고려)
            // Place 통계 캐시 설정
            .withCacheConfiguration("place-stats", 
                defaultConfig.entryTtl(Duration.ofMinutes(10))) // 장소 통계: 10분 (DB 부하 감소)
            .build();
    }
}