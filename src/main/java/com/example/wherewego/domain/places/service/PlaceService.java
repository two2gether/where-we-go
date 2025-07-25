package com.example.wherewego.domain.places.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.dto.response.CourseRouteSummary;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.domain.places.dto.response.PlaceStatsDto;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 장소 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceService {

	private final PlaceReviewRepository placeReviewRepository;
	private final PlaceBookmarkRepository placeBookmarkRepository;
	private final GooglePlaceService googlePlaceService;

	/**
	 * 단일 장소 통계 조회 (사용자 정보 포함)
	 */
	public PlaceStatsDto getPlaceStats(String placeId, Long userId) {
		log.debug("장소 통계 조회 - placeId: {}, userId: {}", placeId, userId);

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
		log.debug("여러 장소 통계 조회 - 장소 수: {}, userId: {}", placeIds.size(), userId);

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
		log.debug("Course용 경로 거리 계산 시작 - 장소 수: {}, 사용자 위치: [{}, {}]",
			placeIds.size(), userLatitude, userLongitude);

		if (placeIds == null || placeIds.isEmpty()) {
			log.warn("장소 ID 목록이 비어있습니다");
			return Collections.emptyList();
		}

		List<CoursePlaceInfo> result = new ArrayList<>();
		CoursePlaceInfo previousPlace = null;

		for (int i = 0; i < placeIds.size(); i++) {
			String placeId = placeIds.get(i);
			int visitOrder = i + 1; // 1부터 시작

			log.debug("{}번째 장소 처리 중 - placeId: {}", visitOrder, placeId);

			try {
				// 1. Google API에서 장소 상세 정보 조회
				PlaceDetailResponse placeDetail = googlePlaceService.getPlaceDetail(placeId);

				if (placeDetail == null) {
					log.warn("장소 정보 조회 실패 - placeId: {}", placeId);
					continue; // 실패한 장소는 건너뛰고 계속 진행
				}

				// 2. 사용자 위치로부터의 직선 거리 계산 (GooglePlaceService 재사용)
				Integer distanceFromUser = calculateDistanceIfPossible(
					userLatitude, userLongitude,
					placeDetail.getLatitude(), placeDetail.getLongitude()
				);

				// 3. 이전 장소로부터의 이동 거리 계산
				Integer distanceFromPrevious = null;
				if (previousPlace != null) {
					distanceFromPrevious = calculateDistanceIfPossible(
						previousPlace.getLatitude(), previousPlace.getLongitude(),
						placeDetail.getLatitude(), placeDetail.getLongitude()
					);

					log.debug("이전 장소로부터 거리: {}m ({}번 → {}번)",
						distanceFromPrevious, visitOrder - 1, visitOrder);
				}

				// 4. Course용 DTO 생성
				CoursePlaceInfo placeInfo = CoursePlaceInfo.builder()
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

				result.add(placeInfo);
				previousPlace = placeInfo; // 다음 반복을 위해 현재 장소를 이전 장소로 저장

				log.debug("{}번째 장소 처리 완료 - {}", visitOrder, placeDetail.getName());

			} catch (Exception e) {
				log.error("{}번째 장소 처리 중 오류 발생 - placeId: {}", visitOrder, placeId, e);
				// 오류 발생해도 다른 장소들은 계속 처리
			}
		}

		log.info("Course용 경로 계산 완료 - 총 {}개 장소 처리됨", result.size());
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
			log.debug("장소 목록이 비어있어 총 거리를 0으로 반환");
			return 0;
		}

		int totalDistance = 0;
		int calculatedSegments = 0;

		// 1. 사용자 위치 → 첫 번째 장소 거리
		CoursePlaceInfo firstPlace = places.get(0);
		if (firstPlace.getDistanceFromUser() != null) {
			totalDistance += firstPlace.getDistanceFromUser();
			calculatedSegments++;
			log.debug("사용자 → 1번 장소: {}m", firstPlace.getDistanceFromUser());
		}

		// 2. 장소 간 순차 이동 거리 합계
		for (CoursePlaceInfo place : places) {
			if (place.getDistanceFromPrevious() != null) {
				totalDistance += place.getDistanceFromPrevious();
				calculatedSegments++;
				log.debug("{}번 → {}번 장소: {}m",
					place.getVisitOrder() - 1, place.getVisitOrder(), place.getDistanceFromPrevious());
			}
		}

		log.info("총 경로 거리 계산 완료 - {}개 구간, 총 {}m", calculatedSegments, totalDistance);
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
	 * GooglePlaceService의 calculateDistance 메서드를 재사용합니다.
	 */
	private Integer calculateDistanceIfPossible(Double lat1, Double lon1, Double lat2, Double lon2) {
		// 모든 좌표가 있어야 거리 계산 가능
		if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
			log.debug("좌표 정보 부족으로 거리 계산 스킵 - 출발: [{}, {}], 도착: [{}, {}]",
				lat1, lon1, lat2, lon2);
			return null;
		}

		// GooglePlaceService의 calculateDistance 메서드 재사용
		return googlePlaceService.calculateDistance(lat1, lon1, lat2, lon2);
	}
}
