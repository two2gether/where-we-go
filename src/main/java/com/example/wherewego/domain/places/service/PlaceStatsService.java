package com.example.wherewego.domain.places.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.places.dto.response.PlaceStatsDto;
import com.example.wherewego.domain.places.entity.PlaceBookmark;
import com.example.wherewego.domain.places.entity.PlaceReview;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 장소 통계 정보 전용 서비스
 * 자기 호출 문제 해결을 위해 PlaceService에서 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceStatsService {

	private final PlaceReviewRepository placeReviewRepository;
	private final PlaceBookmarkRepository placeBookmarkRepository;

	/**
	 * 단일 장소의 통계 정보 조회 (캐시 적용)
	 *
	 * @param placeId 장소 ID
	 * @param userId 사용자 ID (개인화 정보용, null 가능)
	 * @return 장소 통계 및 사용자별 상태 정보
	 */
	@Cacheable(value = "place-stats", key = "@cacheKeyUtil.generatePlaceStatsKey(#placeId, #userId)")
	public PlaceStatsDto getPlaceStats(String placeId, Long userId) {
		log.debug("캐시 미스 - 장소 통계 조회: placeId={}, userId={}", placeId, userId);

		// 배치 쿼리 재활용으로 N+1 문제 해결
		// 단일 장소도 기존 배치 쿼리 메서드를 활용하여 효율성 확보
		Map<String, PlaceStatsDto> statsMap = getPlaceStatsMap(List.of(placeId), userId);
		return statsMap.get(placeId);
	}

	/**
	 * 여러 장소의 통계 정보를 배치로 조회
	 * N+1 쿼리 문제 해결을 위한 최적화된 배치 처리
	 *
	 * @param placeIds 장소 ID 목록
	 * @param userId 사용자 ID (개인화 정보용, null 가능)
	 * @return 장소 ID를 키로 하는 통계 정보 맵
	 */
	public Map<String, PlaceStatsDto> getPlaceStatsMap(List<String> placeIds, Long userId) {
		if (placeIds == null || placeIds.isEmpty()) {
			return Map.of();
		}

		log.debug("배치 통계 조회 시작: {} 개 장소", placeIds.size());

		// 1. 리뷰 개수 배치 조회
		List<PlaceReview> placeReviews = placeReviewRepository.findAllByPlaceIdIn(placeIds);
		Map<String, Long> reviewCountMap = placeReviews.stream()
			.collect(Collectors.groupingBy(PlaceReview::getPlaceId, Collectors.counting()));

		// 2. 평균 평점 배치 조회
		Map<String, Double> averageRatingMap = placeReviews.stream()
			.filter(review -> review.getRating() != null)
			.collect(Collectors.groupingBy(PlaceReview::getPlaceId, 
				Collectors.averagingDouble(PlaceReview::getRating)));

		// 3. 북마크 개수 배치 조회
		List<PlaceBookmark> placeBookmarks = placeBookmarkRepository.findAllByPlaceIdIn(placeIds);
		Map<String, Long> bookmarkCountMap = placeBookmarks.stream()
			.collect(Collectors.groupingBy(PlaceBookmark::getPlaceId, Collectors.counting()));

		// 4. 사용자별 개인화 정보 배치 조회
		List<String> userBookmarkedPlaces = List.of();
		List<String> userReviewedPlaces = List.of();

		if (userId != null) {
			// 사용자 북마크 정보를 Stream으로 처리
			userBookmarkedPlaces = placeBookmarks.stream()
				.filter(bookmark -> bookmark.getUser().getId().equals(userId))
				.map(PlaceBookmark::getPlaceId)
				.toList();
			
			// 사용자 리뷰 정보를 Stream으로 처리
			userReviewedPlaces = placeReviews.stream()
				.filter(review -> review.getUser().getId().equals(userId))
				.map(PlaceReview::getPlaceId)
				.distinct()
				.toList();
		}

		final List<String> bookmarkedPlaces = userBookmarkedPlaces;
		final List<String> reviewedPlaces = userReviewedPlaces;

		// 5. 결과 조합 (메모리 기반 처리, DB 호출 없음)
		return placeIds.stream()
			.collect(Collectors.toMap(
				placeId -> placeId,
				placeId -> PlaceStatsDto.builder()
					.placeId(placeId)
					.reviewCount(reviewCountMap.getOrDefault(placeId, 0L))
					.averageRating(formatRating(averageRatingMap.get(placeId)))
					.bookmarkCount(bookmarkCountMap.getOrDefault(placeId, 0L))
					.isBookmarked(userId != null ? bookmarkedPlaces.contains(placeId) : null)
					.hasUserReview(userId != null ? reviewedPlaces.contains(placeId) : null)
					.build()
			));
	}

	/**
	 * 평점 값을 일관된 형식으로 포맷팅합니다.
	 * null 값은 0.0으로 처리하고, 소수점 2자리까지 반올림합니다.
	 *
	 * @param rating 원본 평점 값 (null 가능)
	 * @return 포맷팅된 평점 (null인 경우 0.0)
	 */
	private Double formatRating(Double rating) {
		if (rating == null) {
			return 0.0;
		}
		return Math.round(rating * 100.0) / 100.0;
	}
}