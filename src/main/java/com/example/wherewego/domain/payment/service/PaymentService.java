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
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.payment.dto.request.CallbackRequestDto;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.payment.dto.response.PaymentResponseDto;
import com.example.wherewego.domain.payment.entity.Payment;
import com.example.wherewego.domain.payment.mapper.PaymentMapper;
import com.example.wherewego.domain.payment.repository.PaymentRepository;
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
	private final PaymentRepository paymentRepository;
	private final OrderRepository orderRepository;

	@Value("${toss.secret.key}")
	private String tossSecretKey;

	/**
	 * PaymentService 생성자
	 *
	 * @param tossWebClient 토스 API 호출을 위한 WebClient Bean
	 * @param paymentRepository 결제 정보 저장용 레포지토리
	 * @param orderRepository 주문 정보 저장/조회용 레포지토리
	 */
	public PaymentService(
		@Qualifier("tossWebClient") WebClient tossWebClient,
		PaymentRepository paymentRepository,
		OrderRepository orderRepository) {
		this.tossWebClient = tossWebClient;
		this.paymentRepository = paymentRepository;
		this.orderRepository = orderRepository;
	}

	/**
	 * 토스페이에 결제 요청을 보냅니다.
	 *
	 * @param requestDto 결제 요청 데이터 (주문번호, 금액, 상품설명 등)
	 * @return 결제 URL과 토큰 등을 담은 응답 DTO
	 * @throws CustomException 결제 실패 시 예외 발생
	 */
	public PaymentResponseDto requestPayment(PaymentRequestDto requestDto) {
		// 1. orderNo 저장 (결제 전 DB 등록)사용자 조회
		Order order = orderRepository.findByOrderNo(requestDto.getOrderNo())
			.orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

		Payment payment = Payment.builder()
			.order(order)
			.orderNo(requestDto.getOrderNo())
			.amount(requestDto.getAmount())
			.build();
		paymentRepository.save(payment); // ✅ DB에 저장

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

		log.info("결제페이지: {}", responseDto.getCheckoutPage());

		// 3. 응답 본문의 code가 0이 아닌 경우 (토스 자체 실패 응답)
		if (responseDto.getCode() != 0) {
			log.error("토스 결제 실패: code={}, msg={}, errorCode={}",
				responseDto.getCode(), responseDto.getMsg(), responseDto.getErrorCode());
			throw new CustomException(ErrorCode.TOSS_PAYMENT_FAILED);
		}

		// 3. 결제 토큰 저장 (응답 성공 시)
		payment.updatePayToken(responseDto.getPayToken());
		paymentRepository.save(payment); // ✅ 다시 저장

		// 4. 성공 응답인 경우 응답 DTO 리턴 (checkoutPage, payToken 포함)
		return responseDto;
	}

	/**
	 * 결제 콜백 정보를 처리하여 결제 승인 상태로 반영합니다.
	 *
	 * @param requestDto 토스 결제 콜백 DTO (주문번호, 금액, 상품설명 등)
	 * @return 토스는 callback URL 호출에 대한 응답 바디를 요구하지 않음.
	 * => 서버에서는 HTTP 200 OK 만 반환하면 됨.
	 * @throws CustomException 주문 내역을 찾을 수 없는 경우.
	 */
	public void processPaymentApproval(CallbackRequestDto requestDto) {
		// 중복 결제 저장 방지
		if (paymentRepository.existsByOrderNo(requestDto.getOrderNo())) {
			log.warn("이미 저장된 결제 정보입니다. orderNo: {}", requestDto.getOrderNo());
			return; // 또는 예외 throw
		}

		// 1. 주문 조회
		Order order = orderRepository.findByOrderNo(requestDto.getOrderNo())
			.orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

		// 2. 주문 상태 변경
		order.markAsPaid();
		orderRepository.save(order);

		// 3. DTO → 엔티티 매핑 및 저장
		Payment payment = PaymentMapper.toEntity(requestDto, order);
		paymentRepository.save(payment);

		log.info("결제 승인 완료 - 주문번호: {}, 금액: {}", requestDto.getOrderNo(), requestDto.getPaidAmount());
	}
}
