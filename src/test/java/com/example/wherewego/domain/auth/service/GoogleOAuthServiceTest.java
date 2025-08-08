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

import com.example.wherewego.domain.auth.dto.social.GoogleUserInfo;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.global.exception.CustomException;
import com.fasterxml.jackson.databind.ObjectMapper;

@DisplayName("GoogleOAuthService 테스트")
public class GoogleOAuthServiceTest {

	@InjectMocks
	private GoogleOAuthService googleOAuthService;

	@Mock
	private ObjectMapper objectMapper;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		// 프로퍼티 주입
		ReflectionTestUtils.setField(googleOAuthService, "clientId", "test-client-id");
		ReflectionTestUtils.setField(googleOAuthService, "clientSecret", "test-client-secret");
		ReflectionTestUtils.setField(googleOAuthService, "redirectUri", "test-redirect-uri");
		// RestTemplate 목 설정
		RestTemplate mockRestTemplate = mock(RestTemplate.class);
		ReflectionTestUtils.setField(googleOAuthService, "restTemplate", mockRestTemplate);
	}

	@Test
	@DisplayName("엑세스 토큰 발급 성공")
	void shouldGetAccessToken_Success() throws Exception {
		// given
		String json = "{\"access_token\":\"fake_access_token\"}";
		ResponseEntity<String> response = new ResponseEntity<>(json, HttpStatus.OK);
		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils
			.getField(googleOAuthService, "restTemplate");
		when(mockRestTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
			.thenReturn(response);
		when(objectMapper.readValue(json, Map.class))
			.thenReturn(Map.of("access_token", "fake_access_token"));

		// when
		String token = googleOAuthService.getAccessToken("fake_code");

		// then
		assertEquals("fake_access_token", token);
	}

	@Test
	@DisplayName("엑세스 토큰 발급 실패: 응답 상태가 OK 가 아닐 때")
	void shouldGetAccessToken_Fail_WhenResponseNotOk() {
		// given
		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils
			.getField(googleOAuthService, "restTemplate");
		ResponseEntity<String> badResponse = new ResponseEntity<>("", HttpStatus.BAD_REQUEST);
		when(mockRestTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
			.thenReturn(badResponse);

		// when / then
		CustomException ex = assertThrows(CustomException.class,
			() -> googleOAuthService.getAccessToken("fake_code"));

		// then
		assertEquals(ErrorCode.GOOGLE_ACCESS_TOKEN_REQUEST_FAILED, ex.getErrorCode());
	}

	@Test
	@DisplayName("엑세스 토큰 발급 실패: HTTP 클라이언트 오류 예외 전파")
	void shouldGetAccessToken_Fail_WhenHttpClientErrorExceptionThrown() {
		// given
		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils
			.getField(googleOAuthService, "restTemplate");
		when(mockRestTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
			.thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

		// when / then
		HttpClientErrorException exception = assertThrows(HttpClientErrorException.class,
			() -> googleOAuthService.getAccessToken("fake_code"));

		// then
		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
	}

	@Test
	@DisplayName("사용자 정보 조회 성공")
	void shouldGetUserInfo_Success() throws Exception {
		// given
		String fakeJson = "{\"id\":\"123\", \"email\":\"test@example.com\", \"name\":\"Tester\"}";
		ResponseEntity<String> fakeResponse = new ResponseEntity<>(fakeJson, HttpStatus.OK);
		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils
			.getField(googleOAuthService, "restTemplate");
		when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
			.thenReturn(fakeResponse);

		GoogleUserInfo fakeUserInfo = new GoogleUserInfo();
		ReflectionTestUtils.setField(fakeUserInfo, "id", "123");
		ReflectionTestUtils.setField(fakeUserInfo, "email", "test@example.com");
		ReflectionTestUtils.setField(fakeUserInfo, "name", "Tester");
		when(objectMapper.readValue(fakeJson, GoogleUserInfo.class)).thenReturn(fakeUserInfo);

		// when
		GoogleUserInfo userInfo = googleOAuthService.getUserInfo("fake_token");

		// then
		assertEquals("123", userInfo.getId());
		assertEquals("test@example.com", userInfo.getEmail());
		assertEquals("Tester", userInfo.getName());
	}

	@Test
	@DisplayName("사용자 정보 조회 실패: 응답 상태가 OK 가 아닐 때")
	void shouldGetUserInfo_Fail_WhenResponseNotOk() {
		// given
		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils
			.getField(googleOAuthService, "restTemplate");
		ResponseEntity<String> badResponse = new ResponseEntity<>("", HttpStatus.BAD_REQUEST);
		when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
			.thenReturn(badResponse);

		// when / then
		CustomException ex = assertThrows(CustomException.class,
			() -> googleOAuthService.getUserInfo("fake_token"));

		// then
		assertEquals(ErrorCode.GOOGLE_USER_INFO_REQUEST_FAILED, ex.getErrorCode());
	}

	@Test
	@DisplayName("사용자 정보 조회 실패: HTTP 클라이언트 오류 예외 시")
	void shouldGetUserInfo_Fail_WhenHttpClientErrorExceptionThrown() {
		// given
		RestTemplate mockRestTemplate = (RestTemplate)ReflectionTestUtils
			.getField(googleOAuthService, "restTemplate");
		when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
			.thenReturn(new ResponseEntity<>("", HttpStatus.BAD_REQUEST));  // null이 아닌 ResponseEntity 반환

		// when / then
		CustomException ex = assertThrows(CustomException.class,
			() -> googleOAuthService.getUserInfo("fake_token"));

		// then
		assertEquals(ErrorCode.GOOGLE_USER_INFO_REQUEST_FAILED, ex.getErrorCode());
	}
}
