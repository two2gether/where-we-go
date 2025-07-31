package com.example.wherewego.domain.places.service;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequestDto;

@ExtendWith(MockitoExtension.class)
@DisplayName("GooglePlaceService 테스트")
class GooglePlaceServiceTest {

	@Mock
	private WebClient googleWebClient;

	@InjectMocks
	private GooglePlaceService googlePlaceService;

	// 거리 계산 기능은 PlaceService로 이동되었음
	// GooglePlaceService는 PlaceSearchService 인터페이스 구현과 객체 생성에 중점

	@Nested
	@DisplayName("서비스 인터페이스 구현")
	class ServiceImplementation {

		@Test
		@DisplayName("PlaceSearchService 인터페이스를 구현한다")
		void shouldImplementPlaceSearchService() {
			// then
			assertThat(googlePlaceService).isInstanceOf(PlaceSearchService.class);
		}

		@Test
		@DisplayName("PlaceSearchRequest 유효성 검증")
		void shouldValidatePlaceSearchRequest() {
			// given
			PlaceSearchRequestDto request = PlaceSearchRequestDto.builder()
				.query("서울역")
				.build();

			// then
			assertThat(request.getQuery()).isEqualTo("서울역");
			assertThat(request.getUserLocation()).isNull();
		}

		@Test
		@DisplayName("사용자 위치가 있는 PlaceSearchRequest 생성")
		void shouldCreatePlaceSearchRequestWithUserLocation() {
			// given
			PlaceSearchRequestDto.UserLocation userLocation = PlaceSearchRequestDto.UserLocation.builder()
				.latitude(37.5665)
				.longitude(126.9780)
				.radius(1000)
				.build();

			PlaceSearchRequestDto request = PlaceSearchRequestDto.builder()
				.query("카페")
				.userLocation(userLocation)
				.build();

			// then
			assertThat(request.getQuery()).isEqualTo("카페");
			assertThat(request.getUserLocation()).isNotNull();
			assertThat(request.getUserLocation().getLatitude()).isEqualTo(37.5665);
			assertThat(request.getUserLocation().getLongitude()).isEqualTo(126.9780);
			assertThat(request.getUserLocation().getRadius()).isEqualTo(1000);
		}
	}
}