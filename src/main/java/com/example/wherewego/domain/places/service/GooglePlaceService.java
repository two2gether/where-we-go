package com.example.wherewego.domain.places.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequestDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 구글 Places API 서비스 (리팩터링된 버전)
 *
 * 기존 단일 클래스를 여러 특화 서비스로 분리하여 단일 책임 원칙을 적용합니다.
 * PlaceSearchService 인터페이스 구현체로서 검색과 상세 조회 기능을 위임합니다.
 */
@Slf4j
@Service("googlePlaceService")
@RequiredArgsConstructor
public class GooglePlaceService implements PlaceSearchService {

	private final GooglePlaceSearchService searchService;
	private final GooglePlaceDetailService detailService;

	/**
	 * 장소 검색 기능을 GooglePlaceSearchService에 위임
	 *
	 * @param request 장소 검색 요청 정보
	 * @return 검색된 장소 목록
	 */
	@Override
	public List<PlaceDetailResponseDto> searchPlaces(PlaceSearchRequestDto request) {
		return searchService.searchPlaces(request);
	}

	/**
	 * 장소 상세 정보 조회를 GooglePlaceDetailService에 위임
	 *
	 * @param placeId 조회할 장소의 고유 ID
	 * @return 장소의 상세 정보
	 */
	@Override
	public PlaceDetailResponseDto getPlaceDetail(String placeId) {
		return detailService.getPlaceDetail(placeId);
	}
}