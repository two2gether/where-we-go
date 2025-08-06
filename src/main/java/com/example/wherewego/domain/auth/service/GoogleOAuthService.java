package com.example.wherewego.domain.auth.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.wherewego.domain.auth.dto.social.GoogleUserInfo;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.global.exception.CustomException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

	@Value("${google.oauth.client-id}")
	private String clientId;

	@Value("${google.oauth.client-secret}")
	private String clientSecret;

	@Value("${google.oauth.redirect-uri}")
	private String redirectUri;

	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();

	public String getAccessToken(String code) {
		String tokenRequestUrl = "https://oauth2.googleapis.com/token";

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		String body = "code=" + code +
			"&client_id=" + clientId +
			"&client_secret=" + clientSecret +
			"&redirect_uri=" + redirectUri +
			"&grant_type=authorization_code";

		HttpEntity<String> request = new HttpEntity<>(body, headers);

		ResponseEntity<String> response = restTemplate.postForEntity(tokenRequestUrl, request, String.class);

		if (response.getStatusCode() == HttpStatus.OK) {
			try {
				Map<String, Object> json = objectMapper.readValue(response.getBody(), Map.class);
				return (String)json.get("access_token");
			} catch (Exception e) {
				throw new CustomException(ErrorCode.GOOGLE_ACCESS_TOKEN_REQUEST_FAILED);
			}
		} else {
			throw new CustomException(ErrorCode.GOOGLE_ACCESS_TOKEN_REQUEST_FAILED);
		}
	}

	public GoogleUserInfo getUserInfo(String accessToken) {
		String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		HttpEntity<String> entity = new HttpEntity<>(headers);

		ResponseEntity<String> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, String.class);

		if (response.getStatusCode() == HttpStatus.OK) {
			try {
				return objectMapper.readValue(response.getBody(), GoogleUserInfo.class);
			} catch (Exception e) {
				throw new CustomException(ErrorCode.GOOGLE_USER_INFO_REQUEST_FAILED);
			}
		} else {
			throw new CustomException(ErrorCode.GOOGLE_USER_INFO_REQUEST_FAILED);
		}
	}
}
