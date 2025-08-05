package com.example.wherewego.domain.payment.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.payment.dto.response.PaymentResponseDto;
import com.example.wherewego.global.exception.CustomException;

import lombok.extern.slf4j.Slf4j;

/**
 * 토스페이 결제 서비스
 */
@Service
@Slf4j
public class PaymentService {

	private static final String TOSS_PAYMENTS_ENDPOINT = "/api/v2/payments";
	private final @Qualifier("tossWebClient") WebClient tossWebClient;

	@Value("${toss.secret.key}")
	private String tossSecretKey;

	/**
	 * PaymentService 생성자
	 *
	 * @param tossWebClient 토스 API 호출을 위한 WebClient Bean
	 */
	public PaymentService(@Qualifier("tossWebClient") WebClient tossWebClient) {
		this.tossWebClient = tossWebClient;
	}

	/**
	 * 토스페이에 결제 요청을 보냅니다.
	 *
	 * @param requestDto 결제 요청 데이터 (주문번호, 금액, 상품설명 등)
	 * @return 결제 URL과 토큰 등을 담은 응답 DTO
	 * @throws CustomException 결제 실패 시 예외 발생
	 */
	public PaymentResponseDto requestPayment(PaymentRequestDto requestDto) {
		// 1. Basic 인증 헤더 생성 (API 키 base64 인코딩)
		String encodedAuth = Base64.getEncoder()
			.encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));

		// 2. WebClient로 토스 결제 API POST 요청
		PaymentResponseDto responseDto = tossWebClient.post()
			.uri(TOSS_PAYMENTS_ENDPOINT) // API 경로 설정(/api/v2/payments)
			.header(HttpHeaders.AUTHORIZATION, "Basic " + encodedAuth) // 인증 헤더
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE) // Content-Type 설정
			.bodyValue(requestDto) // 요청 바디 설정 (JSON 형태로 자동 변환)
			.retrieve() // 응답 수신 준비
			.onStatus(HttpStatusCode::isError, clientResponse -> {
				// HTTP 상태 코드가 4xx 또는 5xx면 예외 처리
				log.error("토스 결제 HTTP 오류 발생: {}", clientResponse.statusCode());
				return clientResponse.createException();
			})
			.bodyToMono(PaymentResponseDto.class) // 응답 JSON을 DTO로 매핑
			.block(); // 동기 방식으로 응답 대기

		// 2. 응답 본문의 code가 0이 아닌 경우 (토스 자체 실패 응답)
		if (responseDto.getCode() != 0) {
			log.error("토스 결제 실패: code={}, msg={}, errorCode={}",
				responseDto.getCode(), responseDto.getMsg(), responseDto.getErrorCode());
			throw new CustomException(ErrorCode.TOSS_PAYMENT_FAILED);
		}

		// 3. 성공 응답인 경우 응답 DTO 리턴 (checkoutPage, payToken 포함)
		return responseDto;
	}
}
