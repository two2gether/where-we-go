package com.example.wherewego.domain.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.global.exception.CustomException;

@DisplayName("KakaoOAuthService 테스트")
class KakaoOAuthServiceTest {

	@InjectMocks
	private KakaoOAuthService kakaoOAuthService;

	@Mock
	private RestTemplate restTemplate;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		// RestTemplate 주입
		ReflectionTestUtils.setField(kakaoOAuthService, "restTemplate", restTemplate);
		// 프로퍼티 주입
		ReflectionTestUtils.setField(kakaoOAuthService, "clientId", "test-client-id");
		ReflectionTestUtils.setField(kakaoOAuthService, "redirectUri", "http://localhost/callback");
	}

	@Test
	@DisplayName("엑세스 토큰 발급 성공")
	void shouldGetAccessToken_Success() {
		// given
		Map<String, String> body = Map.of("access_token", "fake_access_token");
		ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);
		when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(response);

		// when
		String token = kakaoOAuthService.getAccessToken("fake_code");

		// then
		assertEquals("fake_access_token", token);
	}

	@Test
	@DisplayName("엑세스 토큰 발급 실패: 응답 상태가 OK가 아닐 때")
	void shouldGetAccessToken_Fail_WhenResponseNotOk() {
		// given
		ResponseEntity<Map> badResponse = new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
		when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(badResponse);

		// when / then
		CustomException ex = assertThrows(CustomException.class,
			() -> kakaoOAuthService.getAccessToken("fake_code"));
		assertEquals(ErrorCode.KAKAO_ACCESS_TOKEN_REQUEST_FAILED, ex.getErrorCode());
	}

	@Test
	@DisplayName("엑세스 토큰 발급 실패: HTTP 클라이언트 오류 예외 전파")
	void shouldGetAccessToken_Fail_WhenHttpClientErrorExceptionThrown() {
		// given
		when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
			.thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

		// when / then
		HttpClientErrorException ex = assertThrows(HttpClientErrorException.class,
			() -> kakaoOAuthService.getAccessToken("fake_code"));
		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
	}

	@Test
	@DisplayName("사용자 정보 조회 성공")
	void shouldGetUserInfo_Success() {
		// given
		Map<String, Object> fakeUserInfo = Map.of(
			"id", 12345,
			"properties", Map.of("nickname", "Tester")
		);
		ResponseEntity<Map> response = new ResponseEntity<>(fakeUserInfo, HttpStatus.OK);
		when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(response);

		// when
		Map result = kakaoOAuthService.getUserInfo("fake_access_token");

		// then
		assertEquals(12345, result.get("id"));
		assertEquals("Tester", ((Map<?, ?>)result.get("properties")).get("nickname"));
	}

	@Test
	@DisplayName("사용자 정보 조회 실패: 응답 상태가 OK가 아닐 때")
	void shouldGetUserInfo_Fail_WhenResponseNotOk() {
		// given
		ResponseEntity<Map> badResponse = new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
		when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(badResponse);

		// when / then
		CustomException ex = assertThrows(CustomException.class,
			() -> kakaoOAuthService.getUserInfo("fake_access_token"));
		assertEquals(ErrorCode.KAKAO_USER_INFO_REQUEST_FAILED, ex.getErrorCode());
	}
}
