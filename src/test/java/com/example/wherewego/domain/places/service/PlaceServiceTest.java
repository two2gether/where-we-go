package com.example.wherewego.domain.places.service;

import com.example.wherewego.domain.places.dto.response.PlaceStatsDto;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlaceServiceTest {

	@Mock
	private PlaceReviewRepository placeReviewRepository;

	@Mock
	private PlaceBookmarkRepository placeBookmarkRepository;

	@InjectMocks
	private PlaceService placeService;

	@Test
	@DisplayName("단일 장소 통계 조회 - 로그인 사용자")
	void getPlaceStats_WithUser_Success() {
		// Given
		String placeId = "12345";
		Long userId = 1L;

		when(placeReviewRepository.countByPlaceId(placeId)).thenReturn(5L);
		when(placeReviewRepository.getAverageRatingByPlaceId(placeId)).thenReturn(4.236);
		when(placeBookmarkRepository.countByPlaceId(placeId)).thenReturn(10L);
		when(placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)).thenReturn(true);
		when(placeReviewRepository.existsByUserIdAndPlaceId(userId, placeId)).thenReturn(false);

		// When
		PlaceStatsDto result = placeService.getPlaceStats(placeId, userId);

		// Then
		assertThat(result).isNotNull();
		assertThat(result.getPlaceId()).isEqualTo(placeId);
		assertThat(result.getReviewCount()).isEqualTo(5L);
		assertThat(result.getAverageRating()).isEqualTo(4.24);  // 소수점 2자리
		assertThat(result.getBookmarkCount()).isEqualTo(10L);
		assertThat(result.getIsBookmarked()).isTrue();
		assertThat(result.getHasUserReview()).isFalse();
	}

	@Test
	@DisplayName("단일 장소 통계 조회 - 게스트 사용자")
	void getPlaceStats_Guest_Success() {
		// Given
		String placeId = "12345";

		when(placeReviewRepository.countByPlaceId(placeId)).thenReturn(3L);
		when(placeReviewRepository.getAverageRatingByPlaceId(placeId)).thenReturn(null);
		when(placeBookmarkRepository.countByPlaceId(placeId)).thenReturn(7L);

		// When
		PlaceStatsDto result = placeService.getPlaceStats(placeId);

		// Then
		assertThat(result).isNotNull();
		assertThat(result.getPlaceId()).isEqualTo(placeId);
		assertThat(result.getReviewCount()).isEqualTo(3L);
		assertThat(result.getAverageRating()).isEqualTo(0.0); // null인 경우 0.0
		assertThat(result.getBookmarkCount()).isEqualTo(7L);
		assertThat(result.getIsBookmarked()).isNull();
		assertThat(result.getHasUserReview()).isNull();
	}
}