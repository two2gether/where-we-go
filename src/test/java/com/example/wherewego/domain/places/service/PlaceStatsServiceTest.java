package com.example.wherewego.domain.places.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.places.dto.response.PlaceStatsDto;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;
import com.example.wherewego.global.util.CacheKeyUtil;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlaceStatsService 테스트")
class PlaceStatsServiceTest {

	@Mock
	private PlaceReviewRepository placeReviewRepository;

	@Mock
	private PlaceBookmarkRepository placeBookmarkRepository;

	@Mock
	private CacheKeyUtil cacheKeyUtil;

	@InjectMocks
	private PlaceStatsService placeStatsService;

	@Nested
	@DisplayName("단일 장소 통계 조회")
	class GetPlaceStatsTest {

		@Test
		@DisplayName("로그인 사용자 - 장소 통계를 성공적으로 조회한다")
		void getPlaceStats_WithUserId_Success() {
			// given
			String placeId = "test-place-id";
			Long userId = 1L;

			given(placeReviewRepository.getReviewCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 5L}));

			given(placeReviewRepository.getAverageRatingsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 4.5}));

			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 10L}));

			given(placeBookmarkRepository.findBookmarkedPlaceIds(userId, List.of(placeId)))
				.willReturn(Arrays.asList(placeId));

			given(placeReviewRepository.findPlaceIdsWithUserReviews(userId, List.of(placeId)))
				.willReturn(List.of());

			// when
			PlaceStatsDto result = placeStatsService.getPlaceStats(placeId, userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getPlaceId()).isEqualTo(placeId);
			assertThat(result.getReviewCount()).isEqualTo(5L);
			assertThat(result.getAverageRating()).isEqualTo(4.5);
			assertThat(result.getBookmarkCount()).isEqualTo(10L);
			assertThat(result.getIsBookmarked()).isTrue();
			assertThat(result.getHasUserReview()).isFalse();
		}

		@Test
		@DisplayName("비로그인 사용자 - 장소 통계를 성공적으로 조회한다")
		void getPlaceStats_WithoutUserId_Success() {
			// given
			String placeId = "test-place-id";

			given(placeReviewRepository.getReviewCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 5L}));

			given(placeReviewRepository.getAverageRatingsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 4.5}));

			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 10L}));

			// when
			PlaceStatsDto result = placeStatsService.getPlaceStats(placeId, null);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getPlaceId()).isEqualTo(placeId);
			assertThat(result.getReviewCount()).isEqualTo(5L);
			assertThat(result.getAverageRating()).isEqualTo(4.5);
			assertThat(result.getBookmarkCount()).isEqualTo(10L);
			assertThat(result.getIsBookmarked()).isNull();
			assertThat(result.getHasUserReview()).isNull();
		}

		@Test
		@DisplayName("평점이 없는 장소 - 평점을 0.0으로 반환한다")
		void getPlaceStats_NoRating_ReturnsZero() {
			// given
			String placeId = "test-place-id";

			given(placeReviewRepository.getReviewCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 0L}));

			given(placeReviewRepository.getAverageRatingsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, null}));

			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 0L}));

			// when
			PlaceStatsDto result = placeStatsService.getPlaceStats(placeId, null);

			// then
			assertThat(result.getAverageRating()).isEqualTo(0.0);
		}

		@Test
		@DisplayName("소수점 평점 - 2자리까지 반올림한다")
		void getPlaceStats_DecimalRating_RoundsToTwoDecimalPlaces() {
			// given
			String placeId = "test-place-id";

			given(placeReviewRepository.getReviewCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 3L}));

			given(placeReviewRepository.getAverageRatingsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 4.6666666666}));

			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(anyList()))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 0L}));

			// when
			PlaceStatsDto result = placeStatsService.getPlaceStats(placeId, null);

			// then
			assertThat(result.getAverageRating()).isEqualTo(4.67);
		}
	}

	@Nested
	@DisplayName("여러 장소 통계 배치 조회")
	class GetPlaceStatsMapTest {

		@Test
		@DisplayName("로그인 사용자 - 여러 장소 통계를 배치로 조회한다")
		void getPlaceStatsMap_WithUserId_Success() {
			// given
			List<String> placeIds = Arrays.asList("place1", "place2", "place3");
			Long userId = 1L;

			given(placeReviewRepository.getReviewCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 5L},
					new Object[]{"place2", 3L},
					new Object[]{"place3", 8L}
				));

			given(placeReviewRepository.getAverageRatingsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 4.5},
					new Object[]{"place2", 3.8},
					new Object[]{"place3", 4.9}
				));

			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 10L},
					new Object[]{"place2", 7L},
					new Object[]{"place3", 15L}
				));

			given(placeBookmarkRepository.findBookmarkedPlaceIds(userId, placeIds))
				.willReturn(Arrays.asList("place1"));

			given(placeReviewRepository.findPlaceIdsWithUserReviews(userId, placeIds))
				.willReturn(Arrays.asList("place2"));

			// when
			Map<String, PlaceStatsDto> result = placeStatsService.getPlaceStatsMap(placeIds, userId);

			// then
			assertThat(result).hasSize(3);
			
			PlaceStatsDto place1Stats = result.get("place1");
			assertThat(place1Stats.getIsBookmarked()).isTrue();
			assertThat(place1Stats.getHasUserReview()).isFalse();
			
			PlaceStatsDto place2Stats = result.get("place2");
			assertThat(place2Stats.getIsBookmarked()).isFalse();
			assertThat(place2Stats.getHasUserReview()).isTrue();
		}

		@Test
		@DisplayName("비로그인 사용자 - 여러 장소 통계를 배치로 조회한다")
		void getPlaceStatsMap_WithoutUserId_Success() {
			// given
			List<String> placeIds = Arrays.asList("place1", "place2", "place3");

			given(placeReviewRepository.getReviewCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 5L},
					new Object[]{"place2", 3L},
					new Object[]{"place3", 8L}
				));

			given(placeReviewRepository.getAverageRatingsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 4.5},
					new Object[]{"place2", 3.8},
					new Object[]{"place3", 4.9}
				));

			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 10L},
					new Object[]{"place2", 7L},
					new Object[]{"place3", 15L}
				));

			// when
			Map<String, PlaceStatsDto> result = placeStatsService.getPlaceStatsMap(placeIds, null);

			// then
			assertThat(result).hasSize(3);
			assertThat(result.get("place1").getIsBookmarked()).isNull();
			assertThat(result.get("place1").getHasUserReview()).isNull();
		}

		@Test
		@DisplayName("빈 장소 ID 목록 - 빈 Map을 반환한다")
		void getPlaceStatsMap_EmptyPlaceIds_ReturnsEmptyMap() {
			// when
			Map<String, PlaceStatsDto> result = placeStatsService.getPlaceStatsMap(List.of(), 1L);

			// then
			assertThat(result).isEmpty();
		}

		@Test
		@DisplayName("null 장소 ID 목록 - 빈 Map을 반환한다")
		void getPlaceStatsMap_NullPlaceIds_ReturnsEmptyMap() {
			// when
			Map<String, PlaceStatsDto> result = placeStatsService.getPlaceStatsMap(null, 1L);

			// then
			assertThat(result).isEmpty();
		}
	}
}