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
import com.example.wherewego.domain.places.entity.PlaceBookmark;
import com.example.wherewego.domain.places.entity.PlaceReview;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;
import com.example.wherewego.domain.user.entity.User;
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
			
			User user = User.builder()
				.id(userId)
				.email("test@example.com")
				.build();
			
			User otherUser = User.builder()
				.id(2L)
				.email("other@example.com")
				.build();

			// 리뷰 엔티티 생성 (총 5개, 평균 4.6점)
			List<PlaceReview> mockReviews = Arrays.asList(
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(4).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(5).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(4).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(5).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(5).build()
			);

			// 북마크 엔티티 생성 (총 10개, 그 중 userId=1인 북마크 1개 포함)
			List<PlaceBookmark> mockBookmarks = Arrays.asList(
				PlaceBookmark.builder().placeId(placeId).user(user).build(), // userId 북마크
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build()
			);

			given(placeReviewRepository.findAllByPlaceIdIn(anyList())).willReturn(mockReviews);
			given(placeBookmarkRepository.findAllByPlaceIdIn(anyList())).willReturn(mockBookmarks);

			// when
			PlaceStatsDto result = placeStatsService.getPlaceStats(placeId, userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getPlaceId()).isEqualTo(placeId);
			assertThat(result.getReviewCount()).isEqualTo(5L);
			assertThat(result.getAverageRating()).isEqualTo(4.6);
			assertThat(result.getBookmarkCount()).isEqualTo(10L);
			assertThat(result.getIsBookmarked()).isTrue();
			assertThat(result.getHasUserReview()).isFalse();
		}

		@Test
		@DisplayName("비로그인 사용자 - 장소 통계를 성공적으로 조회한다")
		void getPlaceStats_WithoutUserId_Success() {
			// given
			String placeId = "test-place-id";
			
			User otherUser = User.builder().id(2L).email("other@example.com").build();

			// 리뷰 엔티티 생성
			List<PlaceReview> mockReviews = Arrays.asList(
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(5).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(5).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(4).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(4).build(),
				PlaceReview.builder().placeId(placeId).user(otherUser).rating(4).build()
			);

			// 북마크 엔티티 생성
			List<PlaceBookmark> mockBookmarks = Arrays.asList(
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build(),
				PlaceBookmark.builder().placeId(placeId).user(otherUser).build()
			);

			given(placeReviewRepository.findAllByPlaceIdIn(anyList())).willReturn(mockReviews);
			given(placeBookmarkRepository.findAllByPlaceIdIn(anyList())).willReturn(mockBookmarks);

			// when
			PlaceStatsDto result = placeStatsService.getPlaceStats(placeId, null);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getPlaceId()).isEqualTo(placeId);
			assertThat(result.getReviewCount()).isEqualTo(5L);
			assertThat(result.getAverageRating()).isEqualTo(4.4);
			assertThat(result.getBookmarkCount()).isEqualTo(10L);
			assertThat(result.getIsBookmarked()).isNull();
			assertThat(result.getHasUserReview()).isNull();
		}

		@Test
		@DisplayName("평점이 없는 장소 - 평점을 0.0으로 반환한다")
		void getPlaceStats_NoRating_ReturnsZero() {
			// given
			String placeId = "test-place-id";

			// 빈 리스트 반환 (리뷰 없음)
			given(placeReviewRepository.findAllByPlaceIdIn(anyList())).willReturn(List.of());
			given(placeBookmarkRepository.findAllByPlaceIdIn(anyList())).willReturn(List.of());

			// when
			PlaceStatsDto result = placeStatsService.getPlaceStats(placeId, null);

			// then
			assertThat(result.getAverageRating()).isEqualTo(0.0);
			assertThat(result.getReviewCount()).isEqualTo(0L);
			assertThat(result.getBookmarkCount()).isEqualTo(0L);
		}

		@Test
		@DisplayName("소수점 평점 - 2자리까지 반올림한다")
		void getPlaceStats_DecimalRating_RoundsToTwoDecimalPlaces() {
			// given
			String placeId = "test-place-id";
			User user = User.builder().id(1L).email("test@example.com").build();

			// 평점 평균이 4.6666666666이 되도록 설정
			List<PlaceReview> mockReviews = Arrays.asList(
				PlaceReview.builder().placeId(placeId).user(user).rating(5).build(),
				PlaceReview.builder().placeId(placeId).user(user).rating(4).build(),
				PlaceReview.builder().placeId(placeId).user(user).rating(5).build()
			);

			given(placeReviewRepository.findAllByPlaceIdIn(anyList())).willReturn(mockReviews);
			given(placeBookmarkRepository.findAllByPlaceIdIn(anyList())).willReturn(List.of());

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
			
			User user = User.builder().id(userId).email("test@example.com").build();
			User otherUser = User.builder().id(2L).email("other@example.com").build();

			// 리뷰 데이터
			List<PlaceReview> mockReviews = Arrays.asList(
				// place1: 2개 리뷰, 평균 4.5점, userId 리뷰 없음
				PlaceReview.builder().placeId("place1").user(otherUser).rating(4).build(),
				PlaceReview.builder().placeId("place1").user(otherUser).rating(5).build(),
				
				// place2: 1개 리뷰, 평균 4점, userId 리뷰 있음
				PlaceReview.builder().placeId("place2").user(user).rating(4).build(),
				
				// place3: 1개 리뷰, 평균 5점, userId 리뷰 없음
				PlaceReview.builder().placeId("place3").user(otherUser).rating(5).build()
			);

			// 북마크 데이터
			List<PlaceBookmark> mockBookmarks = Arrays.asList(
				// place1: userId 북마크 있음
				PlaceBookmark.builder().placeId("place1").user(user).build(),
				PlaceBookmark.builder().placeId("place1").user(otherUser).build(),
				
				// place2: userId 북마크 없음
				PlaceBookmark.builder().placeId("place2").user(otherUser).build(),
				
				// place3: userId 북마크 없음
				PlaceBookmark.builder().placeId("place3").user(otherUser).build()
			);

			given(placeReviewRepository.findAllByPlaceIdIn(placeIds)).willReturn(mockReviews);
			given(placeBookmarkRepository.findAllByPlaceIdIn(placeIds)).willReturn(mockBookmarks);

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
			
			// 간단한 mock 데이터
			given(placeReviewRepository.findAllByPlaceIdIn(placeIds)).willReturn(List.of());
			given(placeBookmarkRepository.findAllByPlaceIdIn(placeIds)).willReturn(List.of());

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