package com.example.wherewego.global.util;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequestDto;

/**
 * 캐시 키 생성 유틸리티
 * 
 * Google Places API 캐싱을 위한 캐시 키 생성 유틸리티입니다.
 */
@Component
public class CacheKeyUtil {

    private static final String DELIMITER = ":";
    
    
    /**
     * Google Places API 검색용 캐시 키 생성 (성능 최적화)
     * 
     * 위치 기반 캐싱을 그리드 단위로 최적화하여 캐시 효율성을 향상시킵니다.
     * 근접한 위치의 검색 결과를 재사용하여 API 호출을 최소화합니다.
     * 
     * @param request 검색 요청 정보
     * @return 캐시 키
     */
    public String generateGoogleSearchKey(PlaceSearchRequestDto request) {
        StringBuilder keyBuilder = new StringBuilder();
        
        keyBuilder.append(sanitizeForKey(request.getQuery()));
        
        if (request.getUserLocation() != null) {
            // 위치를 그리드 단위로 반올림하여 근접 위치의 캐시 재사용
            Double lat = request.getUserLocation().getLatitude();
            Double lng = request.getUserLocation().getLongitude();
            
            if (lat != null && lng != null) {
                // 약 100m 그리드 단위로 반올림 (도시 지역 기준)
                double gridLat = Math.round(lat * 1000.0) / 1000.0;
                double gridLng = Math.round(lng * 1000.0) / 1000.0;
                
                keyBuilder.append(DELIMITER)
                    .append("lat").append(gridLat)
                    .append("lng").append(gridLng);
            }
            
            // 반경을 표준화된 단위로 그룹화
            if (request.getUserLocation().getRadius() != null) {
                int radius = request.getUserLocation().getRadius();
                int standardRadius = standardizeRadius(radius);
                keyBuilder.append("r").append(standardRadius);
            }
        }
        
        // 페이징 정보는 첫 페이지만 캐싱 (성능 최적화)
        if (request.getPagination() != null && request.getPagination().getPage() <= 1) {
            keyBuilder.append(DELIMITER).append("page1")
                .append("size").append(request.getPagination().getSize());
        }
        
        if (request.getSort() != null) {
            keyBuilder.append(DELIMITER).append("sort").append(request.getSort());
        }
        
        return keyBuilder.toString();
    }
    
    /**
     * Google Places API 상세정보용 캐시 키 생성 (사용자 정보 제외)
     * 
     * @param placeId 장소 ID
     * @return 캐시 키
     */
    public String generateGooglePlaceDetailKey(String placeId) {
        return "google" + DELIMITER + placeId;
    }
    
    /**
     * 장소 통계용 캐시 키 생성
     * 
     * @param placeId 장소 ID
     * @param userId 사용자 ID (null 가능)
     * @return 캐시 키
     */
    public String generatePlaceStatsKey(String placeId, Long userId) {
        StringBuilder keyBuilder = new StringBuilder("stats").append(DELIMITER).append(placeId);
        
        if (userId != null) {
            keyBuilder.append(DELIMITER).append("user").append(userId);
        } else {
            keyBuilder.append(DELIMITER).append("guest");
        }
        
        return keyBuilder.toString();
    }
    
    /**
     * 반경을 표준화된 단위로 그룹화 (캐시 효율성 향상)
     * 
     * @param radius 원본 반경 (미터 단위)
     * @return 표준화된 반경
     */
    private int standardizeRadius(int radius) {
        // 반경을 표준 구간으로 그룹화하여 캐시 재사용률 향상
        if (radius <= 500) return 500;        // ~500m
        if (radius <= 1000) return 1000;      // ~1km
        if (radius <= 2000) return 2000;      // ~2km
        if (radius <= 5000) return 5000;      // ~5km
        if (radius <= 10000) return 10000;    // ~10km
        return 20000;                         // 20km+ (최대)
    }
    
    /**
     * 캐시 키에 안전한 문자열로 변환
     * 
     * @param input 입력 문자열
     * @return 정제된 문자열
     */
    private String sanitizeForKey(String input) {
        if (input == null) {
            return "null";
        }
        
        // 특수문자를 언더스코어로 대체하고 소문자로 변환
        return input.toLowerCase()
            .replaceAll("[^a-zA-Z0-9가-힣]", "_")
            .replaceAll("_+", "_") // 연속된 언더스코어를 하나로
            .replaceAll("^_|_$", ""); // 시작과 끝의 언더스코어 제거
    }
}