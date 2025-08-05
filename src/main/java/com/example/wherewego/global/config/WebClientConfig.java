package com.example.wherewego.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.global.exception.CustomException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class WebClientConfig {

	@Value("${toss.secret-key}")
	private String tossSecretKey;

	@Value("${google.api.key}")
	private String googleApiKey;

	/**
	 * 구글 Maps Places API 호출을 위한 WebClient Bean을 생성합니다.
	 * 구글 API 키 검증과 기본 설정을 포함합니다.
	 *
	 * @return 구글 API 전용 WebClient 인스턴스
	 * @throws CustomException 구글 API 키가 설정되지 않은 경우
	 */
	@Bean(name = "googleWebClient")
	public WebClient googleWebClient() {
		// API 키 로딩 확인을 위한 로깅
		log.info("구글 API 키 로딩 확인 - 키 존재 여부: {}, 키 길이: {}",
			googleApiKey != null, googleApiKey != null ? googleApiKey.length() : 0);

		if (googleApiKey == null || googleApiKey.trim().isEmpty()) {
			log.error("구글 Maps API 키가 설정되지 않았습니다!");
			throw new CustomException(ErrorCode.GOOGLE_API_KEY_MISSING);
		}

		log.debug("구글 API 키 설정 완료: {}...{}",
			googleApiKey.substring(0, Math.min(6, googleApiKey.length())),
			googleApiKey.length() > 6 ? googleApiKey.substring(googleApiKey.length() - 4) : "");

		return WebClient.builder()
			.baseUrl("https://maps.googleapis.com/maps/api/place")
			.codecs(configurer -> configurer
				.defaultCodecs()
				.maxInMemorySize(2 * 1024 * 1024))
			.build();
	}

	@Bean(name = "tossWebClient")
	public WebClient tossWebClient() {
		return WebClient.builder()
			.baseUrl("https://pay.toss.im")
			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.build();
	}
}