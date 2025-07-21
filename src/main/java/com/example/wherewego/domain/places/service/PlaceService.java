package com.example.wherewego.domain.places.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
