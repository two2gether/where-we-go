package com.example.wherewego.domain.places.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("GooglePlaceService 테스트")
class GooglePlaceServiceTest {

	@InjectMocks
	private GooglePlaceService googlePlaceService;

	// WebClient 모킹이 복잡하므로 거리 계산 기능만 테스트

	@Nested
	@DisplayName("거리 계산")
	class CalculateDistance {

		@Test
		@DisplayName("두 지점 간 거리를 정확히 계산한다")
		void calculateDistanceAccurate() {
			// given
			double lat1 = 37.5665; // 서울시청
			double lon1 = 126.9780;
			double lat2 = 37.4979; // 강남역
			double lon2 = 127.0276;

			// when
			int distance = googlePlaceService.calculateDistance(lat1, lon1, lat2, lon2);

			// then
			// 실제 거리는 약 9.2km이므로 9000m 근처여야 함
			assertThat(distance).isBetween(8000, 11000);
		}

		@Test
		@DisplayName("같은 지점의 거리는 0이다")
		void calculateDistanceSamePoint() {
			// given
			double lat = 37.5665;
			double lon = 126.9780;

			// when
			int distance = googlePlaceService.calculateDistance(lat, lon, lat, lon);

			// then
			assertThat(distance).isEqualTo(0);
		}

		@Test
		@DisplayName("짧은 거리도 정확히 계산한다")
		void calculateDistanceShort() {
			// given
			double lat1 = 37.5665;
			double lon1 = 126.9780;
			double lat2 = 37.5675; // 약 100m 차이
			double lon2 = 126.9790;

			// when
			int distance = googlePlaceService.calculateDistance(lat1, lon1, lat2, lon2);

			// then
			// 대략 100-200m 사이여야 함
			assertThat(distance).isBetween(50, 300);
		}
	}
}