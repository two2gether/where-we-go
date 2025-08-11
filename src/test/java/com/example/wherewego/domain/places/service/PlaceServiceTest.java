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

import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.dto.response.CourseRouteSummary;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceStatsDto;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlaceService 테스트")
class PlaceServiceTest {

	@Mock
	private PlaceReviewRepository placeReviewRepository;

	@Mock
	private PlaceBookmarkRepository placeBookmarkRepository;

	@Mock
	private PlaceSearchService placeSearchService;

	@InjectMocks
	private PlaceService placeService;

	@Nested
	@DisplayName("단일 장소 통계 조회")
	class GetPlaceStats {

		private final String placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4";
		private final Long userId = 1L;

		@Test
		@DisplayName("로그인 사용자의 장소 통계를 정상적으로 조회한다")
		void shouldGetPlaceStatsWithUser() {
			// given - 배치 쿼리 메서드 mocking
			given(placeReviewRepository.getReviewCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 10L}));
			given(placeReviewRepository.getAverageRatingsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 4.5}));
			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 5L}));
			given(placeBookmarkRepository.findBookmarkedPlaceIds(userId, List.of(placeId)))
				.willReturn(List.of(placeId));
			given(placeReviewRepository.findPlaceIdsWithUserReviews(userId, List.of(placeId)))
				.willReturn(List.of());

			// when
			PlaceStatsDto result = placeService.getPlaceStats(placeId, userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getPlaceId()).isEqualTo(placeId);
			assertThat(result.getReviewCount()).isEqualTo(10L);
			assertThat(result.getAverageRating()).isEqualTo(4.5);
			assertThat(result.getBookmarkCount()).isEqualTo(5L);
			assertThat(result.getIsBookmarked()).isTrue();
			assertThat(result.getHasUserReview()).isFalse();
		}

		@Test
		@DisplayName("게스트 사용자의 장소 통계를 정상적으로 조회한다")
		void shouldGetPlaceStatsForGuest() {
			// given - 배치 쿼리 메서드 mocking
			given(placeReviewRepository.getReviewCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 10L}));
			given(placeReviewRepository.getAverageRatingsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 4.5}));
			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 5L}));

			// when
			PlaceStatsDto result = placeService.getPlaceStats(placeId, null);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getPlaceId()).isEqualTo(placeId);
			assertThat(result.getReviewCount()).isEqualTo(10L);
			assertThat(result.getAverageRating()).isEqualTo(4.5);
			assertThat(result.getBookmarkCount()).isEqualTo(5L);
			assertThat(result.getIsBookmarked()).isNull();
			assertThat(result.getHasUserReview()).isNull();
		}

		@Test
		@DisplayName("평점이 null인 경우 0.0으로 반환한다")
		void shouldReturnZeroWhenRatingIsNull() {
			// given - 배치 쿼리 메서드 mocking
			given(placeReviewRepository.getReviewCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 0L}));
			given(placeReviewRepository.getAverageRatingsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, null}));
			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 0L}));

			// when
			PlaceStatsDto result = placeService.getPlaceStats(placeId, null);

			// then
			assertThat(result.getAverageRating()).isEqualTo(0.0);
		}

		@Test
		@DisplayName("평점이 소수점 2자리로 포맷팅된다")
		void shouldFormatRatingToTwoDecimals() {
			// given - 배치 쿼리 메서드 mocking
			given(placeReviewRepository.getReviewCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 3L}));
			given(placeReviewRepository.getAverageRatingsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 4.666666}));
			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(List.of(placeId)))
				.willReturn(Arrays.<Object[]>asList(new Object[]{placeId, 0L}));

			// when
			PlaceStatsDto result = placeService.getPlaceStats(placeId, null);

			// then
			assertThat(result.getAverageRating()).isEqualTo(4.67);
		}
	}

	@Nested
	@DisplayName("여러 장소 통계 조회")
	class GetPlaceStatsMap {

		private final List<String> placeIds = Arrays.asList("place1", "place2", "place3");
		private final Long userId = 1L;

		@Test
		@DisplayName("로그인 사용자의 여러 장소 통계를 정상적으로 조회한다")
		void shouldGetPlaceStatsMapWithUser() {
			// given - 배치 쿼리 메서드 mocking
			given(placeReviewRepository.getReviewCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 5L},
					new Object[]{"place2", 8L},
					new Object[]{"place3", 0L}
				));
			given(placeReviewRepository.getAverageRatingsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 4.2},
					new Object[]{"place2", 3.8},
					new Object[]{"place3", null}
				));
			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 3L},
					new Object[]{"place2", 10L},
					new Object[]{"place3", 1L}
				));
			given(placeBookmarkRepository.findBookmarkedPlaceIds(userId, placeIds))
				.willReturn(Arrays.asList("place1", "place3"));
			given(placeReviewRepository.findPlaceIdsWithUserReviews(userId, placeIds))
				.willReturn(Arrays.asList("place1"));

			// when
			Map<String, PlaceStatsDto> result = placeService.getPlaceStatsMap(placeIds, userId);

			// then
			assertThat(result).hasSize(3);

			PlaceStatsDto place1Stats = result.get("place1");
			assertThat(place1Stats.getReviewCount()).isEqualTo(5L);
			assertThat(place1Stats.getAverageRating()).isEqualTo(4.2);
			assertThat(place1Stats.getBookmarkCount()).isEqualTo(3L);
			assertThat(place1Stats.getIsBookmarked()).isTrue();
			assertThat(place1Stats.getHasUserReview()).isTrue();

			PlaceStatsDto place2Stats = result.get("place2");
			assertThat(place2Stats.getReviewCount()).isEqualTo(8L);
			assertThat(place2Stats.getAverageRating()).isEqualTo(3.8);
			assertThat(place2Stats.getBookmarkCount()).isEqualTo(10L);
			assertThat(place2Stats.getIsBookmarked()).isFalse();
			assertThat(place2Stats.getHasUserReview()).isFalse();

			PlaceStatsDto place3Stats = result.get("place3");
			assertThat(place3Stats.getReviewCount()).isEqualTo(0L);
			assertThat(place3Stats.getAverageRating()).isEqualTo(0.0);
			assertThat(place3Stats.getBookmarkCount()).isEqualTo(1L);
			assertThat(place3Stats.getIsBookmarked()).isTrue();
			assertThat(place3Stats.getHasUserReview()).isFalse();
		}

		@Test
		@DisplayName("게스트 사용자의 여러 장소 통계를 정상적으로 조회한다")
		void shouldGetPlaceStatsMapForGuest() {
			// given - 배치 쿼리 메서드 mocking
			given(placeReviewRepository.getReviewCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 5L},
					new Object[]{"place2", 5L},
					new Object[]{"place3", 5L}
				));
			given(placeReviewRepository.getAverageRatingsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 4.0},
					new Object[]{"place2", 4.0},
					new Object[]{"place3", 4.0}
				));
			given(placeBookmarkRepository.getBookmarkCountsByPlaceIds(placeIds))
				.willReturn(Arrays.<Object[]>asList(
					new Object[]{"place1", 2L},
					new Object[]{"place2", 2L},
					new Object[]{"place3", 2L}
				));

			// when
			Map<String, PlaceStatsDto> result = placeService.getPlaceStatsMap(placeIds, null);

			// then
			assertThat(result).hasSize(3);
			result.values().forEach(stats -> {
				assertThat(stats.getIsBookmarked()).isNull();
				assertThat(stats.getHasUserReview()).isNull();
			});
		}
	}

	@Nested
	@DisplayName("코스용 장소 정보 조회")
	class GetPlacesForCourseWithRoute {

		private final List<String> placeIds = Arrays.asList("place1", "place2", "place3");
		private final Double userLat = 37.5665;
		private final Double userLng = 126.9780;

		@Test
		@DisplayName("경로 정보와 함께 장소 정보를 정상적으로 조회한다")
		void shouldGetPlacesForCourseWithRoute() {
			// given
			PlaceDetailResponseDto place1 = PlaceDetailResponseDto.builder()
				.placeId("place1")
				.name("장소1")
				.category("음식점")
				.latitude(37.5700)
				.longitude(126.9800)
				.build();

			PlaceDetailResponseDto place2 = PlaceDetailResponseDto.builder()
				.placeId("place2")
				.name("장소2")
				.category("카페")
				.latitude(37.5750)
				.longitude(126.9850)
				.build();

			PlaceDetailResponseDto place3 = PlaceDetailResponseDto.builder()
				.placeId("place3")
				.name("장소3")
				.category("관광지")
				.latitude(37.5800)
				.longitude(126.9900)
				.build();

			given(placeSearchService.getPlaceDetail("place1")).willReturn(place1);
			given(placeSearchService.getPlaceDetail("place2")).willReturn(place2);
			given(placeSearchService.getPlaceDetail("place3")).willReturn(place3);

			// when
			List<CoursePlaceInfo> result = placeService.getPlacesForCourseWithRoute(placeIds, userLat, userLng);

			// then
			assertThat(result).hasSize(3);

			// 첫 번째 장소 - 실제 거리 계산 검증
			CoursePlaceInfo firstPlace = result.get(0);
			assertThat(firstPlace.getPlaceId()).isEqualTo("place1");
			assertThat(firstPlace.getName()).isEqualTo("장소1");
			assertThat(firstPlace.getVisitOrder()).isEqualTo(1);
			assertThat(firstPlace.getDistanceFromUser()).isNotNull();
			assertThat(firstPlace.getDistanceFromUser()).isPositive();
			assertThat(firstPlace.getDistanceFromPrevious()).isNull();

			// 두 번째 장소
			CoursePlaceInfo secondPlace = result.get(1);
			assertThat(secondPlace.getPlaceId()).isEqualTo("place2");
			assertThat(secondPlace.getName()).isEqualTo("장소2");
			assertThat(secondPlace.getVisitOrder()).isEqualTo(2);
			assertThat(secondPlace.getDistanceFromUser()).isNotNull();
			assertThat(secondPlace.getDistanceFromUser()).isPositive();
			assertThat(secondPlace.getDistanceFromPrevious()).isNotNull();
			assertThat(secondPlace.getDistanceFromPrevious()).isPositive();

			// 세 번째 장소
			CoursePlaceInfo thirdPlace = result.get(2);
			assertThat(thirdPlace.getPlaceId()).isEqualTo("place3");
			assertThat(thirdPlace.getName()).isEqualTo("장소3");
			assertThat(thirdPlace.getVisitOrder()).isEqualTo(3);
			assertThat(thirdPlace.getDistanceFromUser()).isNotNull();
			assertThat(thirdPlace.getDistanceFromUser()).isPositive();
			assertThat(thirdPlace.getDistanceFromPrevious()).isNotNull();
			assertThat(thirdPlace.getDistanceFromPrevious()).isPositive();
		}

		@Test
		@DisplayName("장소 ID 목록이 비어있으면 빈 리스트를 반환한다")
		void shouldReturnEmptyListWhenPlaceListIsEmpty() {
			// when
			List<CoursePlaceInfo> result = placeService.getPlacesForCourseWithRoute(
				List.of(), userLat, userLng);

			// then
			assertThat(result).isEmpty();
		}

		@Test
		@DisplayName("사용자 위치가 없어도 장소 간 거리는 계산된다")
		void shouldCalculateDistanceBetweenPlacesWithoutUserLocation() {
			// given
			PlaceDetailResponseDto place1 = PlaceDetailResponseDto.builder()
				.placeId("place1")
				.name("장소1")
				.latitude(37.5700)
				.longitude(126.9800)
				.build();

			PlaceDetailResponseDto place2 = PlaceDetailResponseDto.builder()
				.placeId("place2")
				.name("장소2")
				.latitude(37.5750)
				.longitude(126.9850)
				.build();

			given(placeSearchService.getPlaceDetail("place1")).willReturn(place1);
			given(placeSearchService.getPlaceDetail("place2")).willReturn(place2);

			// when
			List<CoursePlaceInfo> result = placeService.getPlacesForCourseWithRoute(
				Arrays.asList("place1", "place2"), null, null);

			// then
			assertThat(result).hasSize(2);
			assertThat(result.get(0).getDistanceFromUser()).isNull();
			assertThat(result.get(1).getDistanceFromUser()).isNull();
			assertThat(result.get(1).getDistanceFromPrevious()).isNotNull();
			assertThat(result.get(1).getDistanceFromPrevious()).isPositive();
		}

		@Test
		@DisplayName("장소 정보 조회 실패 시 해당 장소는 건너뛴다")
		void shouldSkipFailedPlace() {
			// given
			PlaceDetailResponseDto place1 = PlaceDetailResponseDto.builder()
				.placeId("place1")
				.name("장소1")
				.latitude(37.5700)
				.longitude(126.9800)
				.build();

			given(placeSearchService.getPlaceDetail("place1")).willReturn(place1);
			given(placeSearchService.getPlaceDetail("place2")).willReturn(null); // 실패
			given(placeSearchService.getPlaceDetail("place3")).willThrow(new RuntimeException("API 오류"));

			// when
			List<CoursePlaceInfo> result = placeService.getPlacesForCourseWithRoute(
				Arrays.asList("place1", "place2", "place3"), userLat, userLng);

			// then
			assertThat(result).hasSize(1);
			assertThat(result.get(0).getPlaceId()).isEqualTo("place1");
		}
	}

	@Nested
	@DisplayName("총 경로 거리 계산")
	class CalculateTotalRouteDistance {

		@Test
		@DisplayName("전체 경로의 총 거리를 정상적으로 계산한다")
		void shouldCalculateTotalRouteDistance() {
			// given
			CoursePlaceInfo place1 = CoursePlaceInfo.builder()
				.visitOrder(1)
				.distanceFromUser(500)
				.distanceFromPrevious(null)
				.build();

			CoursePlaceInfo place2 = CoursePlaceInfo.builder()
				.visitOrder(2)
				.distanceFromUser(800)
				.distanceFromPrevious(300)
				.build();

			CoursePlaceInfo place3 = CoursePlaceInfo.builder()
				.visitOrder(3)
				.distanceFromUser(1200)
				.distanceFromPrevious(400)
				.build();

			List<CoursePlaceInfo> places = Arrays.asList(place1, place2, place3);

			// when
			Integer totalDistance = placeService.calculateTotalRouteDistance(places);

			// then
			assertThat(totalDistance).isEqualTo(1200); // 500 + 300 + 400
		}

		@Test
		@DisplayName("장소 목록이 비어있으면 0을 반환한다")
		void shouldReturnZeroWhenPlaceListIsEmpty() {
			// when
			Integer totalDistance = placeService.calculateTotalRouteDistance(List.of());

			// then
			assertThat(totalDistance).isEqualTo(0);
		}

		@Test
		@DisplayName("거리 정보가 없는 구간은 건너뛴다")
		void shouldSkipNullDistances() {
			// given
			CoursePlaceInfo place1 = CoursePlaceInfo.builder()
				.visitOrder(1)
				.distanceFromUser(null) // null
				.distanceFromPrevious(null)
				.build();

			CoursePlaceInfo place2 = CoursePlaceInfo.builder()
				.visitOrder(2)
				.distanceFromUser(800)
				.distanceFromPrevious(300)
				.build();

			List<CoursePlaceInfo> places = Arrays.asList(place1, place2);

			// when
			Integer totalDistance = placeService.calculateTotalRouteDistance(places);

			// then
			assertThat(totalDistance).isEqualTo(300); // null은 제외하고 300만 계산
		}
	}

	@Nested
	@DisplayName("경로 요약 정보 계산")
	class CalculateRouteSummary {

		@Test
		@DisplayName("경로 요약 정보를 정상적으로 계산한다")
		void shouldCalculateRouteSummary() {
			// given
			CoursePlaceInfo place1 = CoursePlaceInfo.builder()
				.visitOrder(1)
				.distanceFromUser(500)
				.build();

			CoursePlaceInfo place2 = CoursePlaceInfo.builder()
				.visitOrder(2)
				.distanceFromPrevious(300)
				.build();

			List<CoursePlaceInfo> places = Arrays.asList(place1, place2);

			// when
			CourseRouteSummary summary = placeService.calculateRouteSummary(places);

			// then
			assertThat(summary.getTotalDistance()).isEqualTo(800);
			assertThat(summary.getPlaceCount()).isEqualTo(2);
		}

		@Test
		@DisplayName("장소 목록이 비어있으면 기본값을 반환한다")
		void shouldReturnDefaultValuesWhenPlaceListIsEmpty() {
			// when
			CourseRouteSummary summary = placeService.calculateRouteSummary(List.of());

			// then
			assertThat(summary.getTotalDistance()).isEqualTo(0);
			assertThat(summary.getPlaceCount()).isEqualTo(0);
		}
	}

	@Nested
	@DisplayName("거리 계산 검증")
	class DistanceCalculationValidation {

		@Test
		@DisplayName("같은 좌표의 거리는 0이다")
		void shouldReturnZeroForSameCoordinates() {
			// given - 서울시청 같은 좌표
			PlaceDetailResponseDto place = PlaceDetailResponseDto.builder()
				.placeId("same-place")
				.name("서울시청")
				.category("관공서")
				.latitude(37.5665)
				.longitude(126.9780)
				.build();

			given(placeSearchService.getPlaceDetail("same-place")).willReturn(place);

			// when - 같은 좌표에서 거리 계산
			List<CoursePlaceInfo> result = placeService.getPlacesForCourseWithRoute(
				List.of("same-place"), 37.5665, 126.9780);

			// then
			assertThat(result).hasSize(1);
			assertThat(result.get(0).getDistanceFromUser()).isEqualTo(0);
		}

		@Test
		@DisplayName("서울-부산 간 거리가 합리적 범위에 있다")
		void shouldCalculateReasonableDistanceSeoulToBusan() {
			// given - 부산 해운대 좌표
			PlaceDetailResponseDto busanPlace = PlaceDetailResponseDto.builder()
				.placeId("busan-haeundae")
				.name("해운대해수욕장")
				.category("관광지")
				.latitude(35.1585) // 부산 해운대
				.longitude(129.1604)
				.build();

			given(placeSearchService.getPlaceDetail("busan-haeundae")).willReturn(busanPlace);

			// when - 서울시청에서 부산 해운대까지 거리 계산
			List<CoursePlaceInfo> result = placeService.getPlacesForCourseWithRoute(
				List.of("busan-haeundae"), 37.5665, 126.9780);

			// then - 서울-부산 직선거리는 약 330km 정도
			assertThat(result).hasSize(1);
			Integer distance = result.get(0).getDistanceFromUser();
			assertThat(distance).isBetween(300000, 400000); // 300km-400km 범위
		}

		@Test
		@DisplayName("짧은 거리도 정확히 계산한다")
		void shouldCalculateShortDistanceAccurately() {
			// given - 서울시청에서 가까운 곳 (광화문광장)
			PlaceDetailResponseDto nearPlace = PlaceDetailResponseDto.builder()
				.placeId("gwanghwamun")
				.name("광화문광장")
				.category("광장")
				.latitude(37.5759) // 광화문광장
				.longitude(126.9768)
				.build();

			given(placeSearchService.getPlaceDetail("gwanghwamun")).willReturn(nearPlace);

			// when - 서울시청에서 광화문광장까지 거리 계산
			List<CoursePlaceInfo> result = placeService.getPlacesForCourseWithRoute(
				List.of("gwanghwamun"), 37.5665, 126.9780);

			// then - 서울시청-광화문광장은 약 1km 내외
			assertThat(result).hasSize(1);
			Integer distance = result.get(0).getDistanceFromUser();
			assertThat(distance).isBetween(500, 1500); // 0.5km-1.5km 범위
		}
	}
}