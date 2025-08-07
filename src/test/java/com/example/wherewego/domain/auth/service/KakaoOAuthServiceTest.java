package com.example.wherewego.domain.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
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

public class KakaoOAuthServiceTest {

	@InjectMocks
	private KakaoOAuthService kakaoOAuthService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);

		// 리플렉션으로 restTemplate mock 객체 강제 주입
		RestTemplate mockRestTemplate = mock(RestTemplate.class);
		ReflectionTestUtils.setField(kakaoOAuthService, "restTemplate", mockRestTemplate);

		// @Value 필드에 테스트용 값 직접 주입
		ReflectionTestUtils.setField(kakaoOAuthService, "clientId", "test-client-id");
		ReflectionTestUtils.setField(kakaoOAuthService, "redirectUri", "http://localhost/callback");
	}

	@Test
	void getAccessToken_Success() {
		Map<String, String> body = Map.of("access_token", "fake_access_token");
		ResponseEntity<Map> response = new ResponseEntity<>(body, HttpStatus.OK);

		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils.getField(kakaoOAuthService, "restTemplate");

		when(mockRestTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(response);

		String token = kakaoOAuthService.getAccessToken("fake_code");

		assertEquals("fake_access_token", token);
	}

	@Test
	void getAccessToken_Fail_ResponseNotOk() {
		ResponseEntity<Map> badResponse = new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);

		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils.getField(kakaoOAuthService, "restTemplate");

		when(mockRestTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(badResponse);

		CustomException ex = assertThrows(CustomException.class,
			() -> kakaoOAuthService.getAccessToken("fake_code"));

		assertEquals(ErrorCode.KAKAO_ACCESS_TOKEN_REQUEST_FAILED, ex.getErrorCode());
	}

	@Test
	void getAccessToken_Fail_WhenHttpClientErrorExceptionThrown() {
		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils.getField(kakaoOAuthService, "restTemplate");

		when(mockRestTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
			.thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

		HttpClientErrorException ex = assertThrows(HttpClientErrorException.class,
			() -> kakaoOAuthService.getAccessToken("fake_code"));

		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
	}

	@Test
	void getUserInfo_Success() {
		Map<String, Object> fakeUserInfo = Map.of(
			"id", 12345,
			"properties", Map.of("nickname", "Tester")
		);

		ResponseEntity<Map> response = new ResponseEntity<>(fakeUserInfo, HttpStatus.OK);

		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils.getField(kakaoOAuthService, "restTemplate");

		when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(response);

		Map result = kakaoOAuthService.getUserInfo("fake_access_token");

		assertEquals(12345, result.get("id"));
		assertEquals("Tester", ((Map)result.get("properties")).get("nickname"));
	}

	@Test
	void getUserInfo_Fail_ResponseNotOk() {
		ResponseEntity<Map> badResponse = new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);

		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils.getField(kakaoOAuthService, "restTemplate");

		when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
			.thenReturn(badResponse);

		CustomException ex = assertThrows(CustomException.class,
			() -> kakaoOAuthService.getUserInfo("fake_access_token"));

		assertEquals(ErrorCode.KAKAO_USER_INFO_REQUEST_FAILED, ex.getErrorCode());
	}
}
