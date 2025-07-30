package com.example.wherewego.domain.places.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.dto.response.CourseRouteSummary;
import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.domain.places.dto.response.PlaceStatsDto;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;

import lombok.extern.slf4j.Slf4j;

/**
 * 장소 서비스
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class PlaceService {

	private final PlaceReviewRepository placeReviewRepository;
	private final PlaceBookmarkRepository placeBookmarkRepository;
	private final PlaceSearchService placeSearchService;

	public PlaceService(PlaceReviewRepository placeReviewRepository, PlaceBookmarkRepository placeBookmarkRepository,
		@Qualifier(value = "googlePlaceService") PlaceSearchService placeSearchService) {
		this.placeReviewRepository = placeReviewRepository;
		this.placeBookmarkRepository = placeBookmarkRepository;
		this.placeSearchService = placeSearchService;
	}

	/**
	 * 거리 계산과 북마크 상태를 포함한 장소 검색
	 *
	 * @param request 검색 요청 정보
	 * @param userId 사용자 ID (null 가능)
	 * @return 거리 정보와 북마크 상태가 포함된 검색 결과
	 */
	public List<PlaceDetailResponse> searchPlacesWithDistance(PlaceSearchRequest request, Long userId) {
		// 외부 API로 검색
		List<PlaceDetailResponse> searchResults = placeSearchService.searchPlaces(request);

		// 각 장소에 대해 거리 정보와 북마크/통계 정보 추가
		return searchResults.stream()
			.map(place -> addDistanceAndStatsToPlace(place, request, userId))
			.toList();
	}

	/**
	 * 장소에 거리 정보와 북마크/통계 정보 추가
	 */
	private PlaceDetailResponse addDistanceAndStatsToPlace(PlaceDetailResponse place, PlaceSearchRequest request,
		Long userId) {
		PlaceDetailResponse.PlaceDetailResponseBuilder builder = place.toBuilder();

		// 거리 정보 추가 (사용자 위치가 있는 경우)
		if (request.getUserLocation() != null &&
			request.getUserLocation().getLatitude() != null &&
			request.getUserLocation().getLongitude() != null &&
			place.getLatitude() != null &&
			place.getLongitude() != null) {

			Double userLat = request.getUserLocation().getLatitude();
			Double userLon = request.getUserLocation().getLongitude();
			Integer distance = calculateDistanceInternal(userLat, userLon, place.getLatitude(), place.getLongitude());
			builder.distance(distance);
		}

		// 북마크/통계 정보 추가
		PlaceStatsDto stats = getPlaceStats(place.getPlaceId(), userId);
		builder.averageRating(stats.getAverageRating())
			.reviewCount(stats.getReviewCount().intValue())
			.bookmarkCount(stats.getBookmarkCount().intValue())
			.isBookmarked(stats.getIsBookmarked());

		return builder.build();
	}

	/**
	 * 장소에 거리 정보 추가 (기존 메서드 유지 - 호환성)
	 */
	private PlaceDetailResponse addDistanceToPlace(PlaceDetailResponse place, Double userLat, Double userLon) {
		if (place.getLatitude() == null || place.getLongitude() == null) {
			return place;
		}

		Integer distance = calculateDistanceInternal(userLat, userLon, place.getLatitude(), place.getLongitude());

		return place.toBuilder()
			.distance(distance)
			.build();
	}

	/**
	 * 통계 정보가 포함된 장소 상세 조회
	 *
	 * @param placeId 장소 ID
	 * @param userId 사용자 ID (null 가능)
	 * @return 통계 정보가 포함된 장소 상세 정보
	 */
	public PlaceDetailResponse getPlaceDetailWithStats(String placeId, Long userId) {
		// 외부 API에서 기본 장소 정보 조회
		PlaceDetailResponse placeDetail = placeSearchService.getPlaceDetail(placeId);

		if (placeDetail == null) {
			return null;
		}

		// 통계 정보 조회
		PlaceStatsDto stats = getPlaceStats(placeId, userId);

		// 통계 정보를 포함한 응답 생성
		return placeDetail.toBuilder()
			.averageRating(stats.getAverageRating())
			.reviewCount(stats.getReviewCount().intValue())
			.bookmarkCount(stats.getBookmarkCount().intValue())
			.isBookmarked(stats.getIsBookmarked())
			.build();
	}

	/**
	 * 단일 장소 통계 조회 (사용자 정보 포함)
	 */
	public PlaceStatsDto getPlaceStats(String placeId, Long userId) {
		// 장소 통계 조회

		long reviewCount = placeReviewRepository.countByPlaceId(placeId);
		Double averageRating = placeReviewRepository.getAverageRatingByPlaceId(placeId);
		long bookmarkCount = placeBookmarkRepository.countByPlaceId(placeId);

		Boolean isBookmarked = null;
		Boolean hasUserReview = null;

		if (userId != null) {
			isBookmarked = placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId);
			hasUserReview = placeReviewRepository.existsByUserIdAndPlaceId(userId, placeId);
		}

		return PlaceStatsDto.builder()
			.placeId(placeId)
			.reviewCount(reviewCount)
			.averageRating(formatRating(averageRating))  // 포맷팅 적용
			.bookmarkCount(bookmarkCount)
			.isBookmarked(isBookmarked)
			.hasUserReview(hasUserReview)
			.build();
	}

	/**
	 * 단일 장소 통계 조회 (게스트용)
	 */
	public PlaceStatsDto getPlaceStats(String placeId) {
		return getPlaceStats(placeId, null);
	}

	/**
	 * 여러 장소 통계 조회
	 */
	public Map<String, PlaceStatsDto> getPlaceStatsMap(List<String> placeIds, Long userId) {
		// 여러 장소 통계 조회

		// 사용자별 북마크 상태
		List<String> bookmarkedPlaceIds = List.of();
		if (userId != null) {
			bookmarkedPlaceIds = placeBookmarkRepository.findBookmarkedPlaceIds(userId, placeIds);
		}
		final List<String> userBookmarks = bookmarkedPlaceIds;

		return placeIds.stream()
			.collect(Collectors.toMap(
				placeId -> placeId,
				placeId -> {
					// 각 장소별로 개별 조회 (향후 최적화 가능)
					Long reviewCount = placeReviewRepository.countByPlaceId(placeId);
					Double averageRating = placeReviewRepository.getAverageRatingByPlaceId(placeId);
					Long bookmarkCount = placeBookmarkRepository.countByPlaceId(placeId);

					Boolean isBookmarked = userId != null ? userBookmarks.contains(placeId) : null;
					Boolean hasUserReview = userId != null ?
						placeReviewRepository.existsByUserIdAndPlaceId(userId, placeId) : null;

					return PlaceStatsDto.builder()
						.placeId(placeId)
						.reviewCount(reviewCount)
						.averageRating(formatRating(averageRating))
						.bookmarkCount(bookmarkCount)
						.isBookmarked(isBookmarked)
						.hasUserReview(hasUserReview)
						.build();
				}
			));
	}

	/**
	 * 여러 장소 통계 조회 (게스트용)
	 */
	public Map<String, PlaceStatsDto> getPlaceStatsMap(List<String> placeIds) {
		return getPlaceStatsMap(placeIds, null);
	}

	/**
	 * 평점 포맷팅 (소수점 2자리, null 처리)
	 */
	private Double formatRating(Double rating) {
		if (rating == null) {
			return 0.0;
		}
		return Math.round(rating * 100.0) / 100.0;
	}

	// ====================== 코스용 메서드 ==========================

	/**
	 * Course용 장소 정보 조회 (경로 거리 계산 포함)
	 *
	 * 사용자 위치에서 시작하여 각 장소를 순서대로 방문하는 경로의 거리를 계산합니다.
	 * - 사용자 위치 → 각 장소의 직선 거리
	 * - 장소 간 순차 이동 거리 (1→2→3→4...)
	 *
	 * @param placeIds 방문 순서대로 정렬된 장소 ID 목록
	 * @param userLatitude 사용자 시작 위치 위도 (null 가능)
	 * @param userLongitude 사용자 시작 위치 경도 (null 가능)
	 * @return 경로 정보가 포함된 장소 목록
	 */
	public List<CoursePlaceInfo> getPlacesForCourseWithRoute(
		List<String> placeIds,
		Double userLatitude,
		Double userLongitude
	) {
		// Course용 경로 계산 시작

		if (placeIds == null || placeIds.isEmpty()) {
			return Collections.emptyList();
		}

		List<CoursePlaceInfo> result = new ArrayList<>();
		CoursePlaceInfo previousPlace = null;

		for (int i = 0; i < placeIds.size(); i++) {
			String placeId = placeIds.get(i);
			int visitOrder = i + 1; // 1부터 시작

			CoursePlaceInfo placeInfo = processSinglePlaceForCourse(
				placeId, visitOrder, userLatitude, userLongitude, previousPlace
			);

			if (placeInfo != null) {
				result.add(placeInfo);
				previousPlace = placeInfo;
			}
		}

		return result;
	}

	/**
	 * 총 경로 거리 계산
	 *
	 * 사용자 위치에서 시작하여 모든 장소를 순서대로 방문하는 전체 경로의 총 거리를 계산합니다.
	 * 계산 방식: (사용자 → 1번 장소) + (1번 → 2번) + (2번 → 3번) + ...
	 *
	 * @param places 경로 정보가 포함된 장소 목록 (getPlacesForCourseWithRoute 결과)
	 * @return 총 경로 거리 (미터), 계산 불가능한 경우 0
	 */
	public Integer calculateTotalRouteDistance(List<CoursePlaceInfo> places) {
		if (places == null || places.isEmpty()) {
			// 빈 목록, 거리 0 반환
			return 0;
		}

		int totalDistance = 0;
		int calculatedSegments = 0;

		// 1. 사용자 위치 → 첫 번째 장소 거리
		CoursePlaceInfo firstPlace = places.get(0);
		if (firstPlace.getDistanceFromUser() != null) {
			totalDistance += firstPlace.getDistanceFromUser();
			calculatedSegments++;
			// 사용자에서 첫 장소로의 거리 추가
		}

		// 2. 장소 간 순차 이동 거리 합계
		for (CoursePlaceInfo place : places) {
			if (place.getDistanceFromPrevious() != null) {
				totalDistance += place.getDistanceFromPrevious();
				calculatedSegments++;
				// 장소 간 이동 거리 추가
			}
		}

		return totalDistance;
	}

	/**
	 * 경로 요약 정보 계산
	 *
	 * @param places 장소 목록
	 * @return 경로 요약 정보
	 */
	public CourseRouteSummary calculateRouteSummary(List<CoursePlaceInfo> places) {
		if (places == null || places.isEmpty()) {
			return CourseRouteSummary.builder()
				.totalDistance(0)
				.placeCount(0)
				.build();
		}

		Integer totalDistance = calculateTotalRouteDistance(places);

		return CourseRouteSummary.builder()
			.totalDistance(totalDistance)
			.placeCount(places.size())
			.build();
	}

	/**
	 * 거리 계산 (조건 확인 후)
	 *
	 * 모든 좌표가 있을 때만 거리를 계산합니다.
	 */
	private Integer calculateDistanceIfPossible(Double lat1, Double lon1, Double lat2, Double lon2) {
		// 모든 좌표가 있어야 거리 계산 가능
		if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
			// 좌표 정보 부족으로 거리 계산 스킵
			return null;
		}

		// Haversine 공식을 사용하여 거리 계산
		return calculateDistanceInternal(lat1, lon1, lat2, lon2);
	}

	/**
	 * 두 지점 간 거리 계산 (Haversine 공식)
	 *
	 * Haversine 공식은 지구를 완전한 구체로 가정하여 두 지점 간의 최단 거리(직선거리)를 계산합니다.
	 * GPS 좌표계에서 위도/경도를 이용해 실제 지구상의 거리를 구하는 표준적인 방법입니다.
	 *
	 * @param lat1 첫 번째 지점 위도 (도 단위)
	 * @param lon1 첫 번째 지점 경도 (도 단위)
	 * @param lat2 두 번째 지점 위도 (도 단위)
	 * @param lon2 두 번째 지점 경도 (도 단위)
	 * @return 거리 (미터)
	 */
	private Integer calculateDistanceInternal(double lat1, double lon1, double lat2, double lon2) {
		final int EARTH_RADIUS = 6371000; // 지구 평균 반지름 (미터)

		// 1단계: 도(degree)를 라디안(radian)으로 변환 (삼각함수 계산용)
		double lat1Rad = Math.toRadians(lat1);
		double lat2Rad = Math.toRadians(lat2);
		double deltaLat = Math.toRadians(lat2 - lat1); // 위도 차이
		double deltaLon = Math.toRadians(lon2 - lon1); // 경도 차이

		// 2단계: Haversine 공식으로 구면상의 각도 관계 계산
		double haversineValue = calculateHaversineValue(lat1Rad, lat2Rad, deltaLat, deltaLon);

		// 3단계: 각도 관계를 실제 각도(라디안)로 변환
		double angularDistance = 2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

		// 4단계: 각도에 지구 반지름을 곱해서 실제 거리(미터) 계산
		return (int)(EARTH_RADIUS * angularDistance);
	}

	/**
	 * Haversine 공식의 핵심 계산 부분
	 *
	 * 구면 삼각법을 이용해 두 지점 사이의 각도 관계를 계산합니다.
	 * 공식: a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
	 * 이 값은 두 지점 사이의 구면상 "반현(半弦)" 값을 나타냅니다.
	 */
	private double calculateHaversineValue(double lat1Rad, double lat2Rad, double deltaLat, double deltaLon) {
		// 위도 차이의 절반에 대한 사인값 제곱
		double sinHalfDeltaLat = Math.sin(deltaLat / 2);
		// 경도 차이의 절반에 대한 사인값 제곱  
		double sinHalfDeltaLon = Math.sin(deltaLon / 2);

		// Haversine 공식: 구면상 두 점 사이의 각도 관계를 수치로 표현
		return sinHalfDeltaLat * sinHalfDeltaLat +                    // 위도 차이 영향
			Math.cos(lat1Rad) * Math.cos(lat2Rad) *               // 위도별 경도 보정
				sinHalfDeltaLon * sinHalfDeltaLon;                    // 경도 차이 영향
	}

	/**
	 * 단일 장소를 Course용 데이터로 처리
	 */
	private CoursePlaceInfo processSinglePlaceForCourse(
		String placeId, int visitOrder, Double userLatitude, Double userLongitude,
		CoursePlaceInfo previousPlace) {

		try {
			PlaceDetailResponse placeDetail = placeSearchService.getPlaceDetail(placeId);

			if (placeDetail == null) {
				return null;
			}

			return buildCoursePlaceInfo(placeDetail, visitOrder, userLatitude, userLongitude, previousPlace);

		} catch (Exception e) {
			log.error("{}번째 장소 처리 중 오류 발생 - placeId: {}", visitOrder, placeId, e);
			return null;
		}
	}

	/**
	 * PlaceDetailResponse로 CoursePlaceInfo 생성
	 */
	private CoursePlaceInfo buildCoursePlaceInfo(
		PlaceDetailResponse placeDetail, int visitOrder,
		Double userLatitude, Double userLongitude,
		CoursePlaceInfo previousPlace) {

		// 사용자 위치로부터의 직선 거리 계산
		Integer distanceFromUser = calculateDistanceIfPossible(
			userLatitude, userLongitude,
			placeDetail.getLatitude(), placeDetail.getLongitude()
		);

		// 이전 장소로부터의 이동 거리 계산
		Integer distanceFromPrevious = null;
		if (previousPlace != null) {
			distanceFromPrevious = calculateDistanceIfPossible(
				previousPlace.getLatitude(), previousPlace.getLongitude(),
				placeDetail.getLatitude(), placeDetail.getLongitude()
			);
		}

		// Course용 DTO 생성
		return CoursePlaceInfo.builder()
			.placeId(placeDetail.getPlaceId())
			.name(placeDetail.getName())
			.category(placeDetail.getCategory())
			.latitude(placeDetail.getLatitude())
			.longitude(placeDetail.getLongitude())
			.distanceFromUser(distanceFromUser)
			.distanceFromPrevious(distanceFromPrevious)
			.visitOrder(visitOrder)
			.imageUrl(placeDetail.getPhoto())
			.build();
	}
}
