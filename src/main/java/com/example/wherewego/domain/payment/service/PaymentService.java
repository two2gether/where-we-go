package com.example.wherewego.domain.payment.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.common.enums.PaymentStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.service.OrderService;
import com.example.wherewego.domain.payment.dto.request.CallbackRequestDto;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.payment.dto.request.RefundRequestDto;
import com.example.wherewego.domain.payment.dto.response.PaymentDetailResponseDto;
import com.example.wherewego.domain.payment.dto.response.PaymentResponseDto;
import com.example.wherewego.domain.payment.dto.response.RefundResponseDto;
import com.example.wherewego.domain.payment.entity.Payment;
import com.example.wherewego.domain.payment.mapper.PaymentMapper;
import com.example.wherewego.domain.payment.repository.PaymentRepository;
import com.example.wherewego.global.exception.CustomException;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/**
 * 토스페이 결제 서비스
 */
@Service
@Slf4j
public class PaymentService {

	private static final String TOSS_PAYMENTS_ENDPOINT = "/api/v2/payments";
	private final @Qualifier("tossWebClient") WebClient tossWebClient;
	private final PaymentRepository paymentRepository;
	private final OrderService orderService;

	@Value("${toss.secret.key}")
	private String tossSecretKey;

	/**
	 * PaymentService 생성자
	 *
	 * @param tossWebClient 토스 API 호출을 위한 WebClient Bean
	 * @param paymentRepository 결제 정보 저장용 레포지토리
	 * @param orderService 주문 정보 관리용 서비스
	 */
	public PaymentService(
		@Qualifier("tossWebClient") WebClient tossWebClient,
		PaymentRepository paymentRepository,
		OrderService orderService) {
		this.tossWebClient = tossWebClient;
		this.paymentRepository = paymentRepository;
		this.orderService = orderService;
	}

	/**
	 * 토스페이에 결제 요청을 보냅니다.
	 *
	 * @param requestDto 결제 요청 데이터 (주문번호, 금액, 상품설명 등)
	 * @return 결제 URL과 토큰 등을 담은 응답 DTO
	 * @throws CustomException 결제 실패 시 예외 발생
	 */
<<<<<<< HEAD
	public PaymentResponseDto requestPayment(PaymentRequestDto requestDto) {
		// 1. orderNo 저장 (결제 전 DB 등록)사용자 조회
		Order order = orderService.getOrderByOrderNo(requestDto.getOrderNo());
=======
	@Transactional
	public PaymentResponseDto requestPayment(PaymentRequestDto requestDto, Long userId) {
		// 1. 주문 조회
		Order order = orderService.getOrderByOrderNo(requestDto.getOrderNo());
		
		// 2. 주문 소유권 검증 - 본인의 주문인지 확인
		if (!order.getUser().getId().equals(userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_ORDER_ACCESS);
		}
>>>>>>> c6f1ff300ee190a28ffd2ae545d49219e6645be5

		Payment payment = Payment.builder()
			.order(order)
			.orderNo(requestDto.getOrderNo())
			.amount(requestDto.getAmount())
			.build();
		paymentRepository.save(payment); // ✅ DB에 저장

		// 2. Basic 인증 헤더 생성 (API 키 base64 인코딩)
		String encodedAuth = Base64.getEncoder()
			.encodeToString((tossSecretKey + ":").getBytes(StandardCharsets.UTF_8));

		// 3. WebClient로 토스 결제 API POST 요청
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

		// 4. 응답 본문의 code가 0이 아닌 경우 (토스 자체 실패 응답)
		if (responseDto.getCode() != 0) {
			log.error("토스 결제 실패: code={}, msg={}, errorCode={}",
				responseDto.getCode(), responseDto.getMsg(), responseDto.getErrorCode());
			throw new CustomException(ErrorCode.TOSS_PAYMENT_FAILED);
		}

		// 5. 결제 토큰 저장 (응답 성공 시)
		payment.updatePayToken(responseDto.getPayToken());
		paymentRepository.save(payment); // ✅ 다시 저장

		// 6. 성공 응답인 경우 응답 DTO 리턴 (checkoutPage, payToken 포함)
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
	@Transactional
	public void processPaymentApproval(CallbackRequestDto requestDto) {
		// 1. 중복 결제 콜백 체크 (원자적 처리)
		if (paymentRepository.existsByOrderNo(requestDto.getOrderNo())) {
			log.info("중복 결제 콜백 감지 - 주문번호: {}, 이미 처리된 결제입니다.", requestDto.getOrderNo());
			return; // 중복 콜백은 정상 시나리오로 처리
		}

<<<<<<< HEAD
		// 1. 주문 조회
=======
		// 2. 주문 조회
>>>>>>> c6f1ff300ee190a28ffd2ae545d49219e6645be5
		Order order = orderService.getOrderByOrderNo(requestDto.getOrderNo());

		// 3. 재고 확인 + 감소 처리
		EventProduct product = order.getEventProduct(); // 주문한 상품
		int quantity = order.getQuantity(); // 주문 수량

		if (product.getStock() < quantity) {
			log.error("재고 부족 - productId: {}, 남은 재고: {}, 요청 수량: {}",
				product.getId(), product.getStock(), quantity);
			throw new CustomException(ErrorCode.EVENT_PRODUCT_OUT_OF_STOCK);
		}
		product.decreaseStock(quantity); // 재고 감소 (엔티티 내부 로직)

		// 4. 주문 상태 변경
		order.markAsPaid();
		orderService.updateOrder(order);

		// 5. DTO → 엔티티 매핑 및 저장
		Payment payment = PaymentMapper.toEntity(requestDto, order);
		paymentRepository.save(payment);

		log.info("결제 승인 완료 - 주문번호: {}, 금액: {}", requestDto.getOrderNo(), requestDto.getPaidAmount());
	}

	/**
	 * 특정 주문의 결제 상세 정보를 조회합니다.
	 * 본인의 주문만 조회 가능하며, 민감정보는 마스킹 처리되고 환부 정보도 포함됩니다.
	 *
	 * @param orderId 주문 ID
	 * @param userId 사용자 ID (본인 확인용)
	 * @return 결제 상세 정보 (환불 정보 포함)
	 * @throws CustomException 주문을 찾을 수 없거나 결제 정보가 없는 경우
	 */
	public PaymentDetailResponseDto getPaymentDetail(Long orderId, Long userId) {
		// 1. 본인 주문인지 확인하고 결제 정보 조회
		Payment payment = paymentRepository.findByOrderIdAndUserId(orderId, userId)
			.orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

		// 2. DTO 변환 (민감정보 마스킹 및 환불 정보 포함)
		PaymentDetailResponseDto.PaymentDetailResponseDtoBuilder builder = PaymentMapper.toPaymentDetailDto(payment)
			.toBuilder();

		// 3. 환불 정보 추가
		builder.refundable(isRefundable(payment))
			.refundReason(payment.getRefundReason())
			.refundedAt(payment.getRefundedAt())
			.refundUnavailableReason(getRefundUnavailableReason(payment));

		return builder.build();
	}

	/**
	 * 환불 요청 처리 (전액 환불만 지원)
	 *
	 * @param orderId 주문 ID
	 * @param requestDto 환불 요청 정보
	 * @param userId 사용자 ID (본인 확인용)
	 * @return 환불 요청 결과
	 * @throws CustomException 환불 불가능한 경우 또는 TOSS API 호출 실패 시
	 */
	@Transactional
	public RefundResponseDto requestRefund(Long orderId, RefundRequestDto requestDto, Long userId) {
		// 1. 결제 정보 조회 및 검증
		Payment payment = validateRefundEligibility(orderId, userId);

		// 2. 환불 요청 상태로 변경
		payment.requestRefund(requestDto.getRefundReason(), userId);

		// 3. TOSS API 호출
		callTossRefundApi(payment);

		// 4. 응답 DTO 생성
		return RefundResponseDto.builder()
			.paymentId(payment.getId())
			.orderId(payment.getOrder().getId())
			.refundAmount(payment.getAmount())
			.refundReason(payment.getRefundReason())
			.refundStatus(payment.getPaymentStatus())
			.refundedAt(payment.getRefundedAt())
			.build();
	}

	/**
	 * 환불 가능성 검증
	 *
	 * @param orderId 주문 ID
	 * @param userId 사용자 ID (본인 확인용)
	 * @return 환불 가능한 결제 정보
	 * @throws CustomException 환불 불가능한 경우 (결제 정보 없음, 이미 환불됨, 기간 만료 등)
	 */
	private Payment validateRefundEligibility(Long orderId, Long userId) {
		// 결제 정보 조회
		Payment payment = paymentRepository.findByOrderIdAndUserId(orderId, userId)
			.orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

		// 결제 상태 확인 (결제 완료된 건만 환불 가능)
		if (!PaymentStatus.DONE.equals(payment.getPaymentStatus())) {
			throw new CustomException(ErrorCode.INVALID_PAYMENT_STATUS);
		}

		// 환불 시간 제한 확인 (7일)
		LocalDateTime paymentDate = payment.getCreatedAt();
		if (paymentDate.isBefore(LocalDateTime.now().minusDays(7))) {
			throw new CustomException(ErrorCode.REFUND_TIME_EXPIRED);
		}

		// 이미 환불된 결제인지 확인
		if (PaymentStatus.REFUNDED.equals(payment.getPaymentStatus()) ||
			PaymentStatus.REFUND_REQUESTED.equals(payment.getPaymentStatus())) {
			throw new CustomException(ErrorCode.REFUND_ALREADY_REQUESTED);
		}

		return payment;
	}

	/**
	 * TOSS 환불 API 호출 및 환불 처리
	 *
	 * @param payment 환불 처리할 결제 정보
	 * @throws CustomException TOSS API 호출 실패 시
	 */
	private void callTossRefundApi(Payment payment) {
		// 고유한 환불 번호 생성 (UUID 사용 - orderNo와 동일한 방식)
		String refundNo = UUID.randomUUID().toString();

		// TOSS 환불 API 요청 바디 생성
		Map<String, Object> refundRequest = Map.of(
			"apiKey", tossSecretKey,
			"payToken", payment.getPayToken(),
			"refundNo", refundNo,
			"amount", payment.getAmount(),
			"reason", payment.getRefundReason()
		);

		// TOSS 환불 API 호출
		String response = tossWebClient.post()
			.uri("/api/v2/refunds")
			.headers(headers -> headers.setContentType(MediaType.APPLICATION_JSON))
			.bodyValue(refundRequest)
			.retrieve()
			.onStatus(HttpStatusCode::isError, clientResponse -> {
				log.error("TOSS 환불 API 호출 실패 - 결제ID: {}, HTTP 상태: {}",
					payment.getId(), clientResponse.statusCode());
				// 환불 실패 상태로 변경
				payment.updatePaymentStatus(PaymentStatus.REFUND_FAILED);
				paymentRepository.save(payment);
				return Mono.error(new CustomException(ErrorCode.REFUND_PROCESSING_ERROR));
			})
			.bodyToMono(String.class)
			.block();

		// TOSS 응답 처리 (성공 시 도달)
		log.info("TOSS 환불 API 응답: {}", response);

		// 환불 성공 처리
		processRefundSuccess(payment, refundNo);
	}

	/**
	 * 환불 성공 후 처리 로직
	 *
	 * @param payment 환불 처리할 결제 정보
	 * @param refundNo 환불 번호
	 */
	private void processRefundSuccess(Payment payment, String refundNo) {
		// 결제 상태를 환불 완료로 변경
		payment.processRefund(payment.getRefundReason(), payment.getRefundRequestedBy(), refundNo);
		paymentRepository.save(payment);

		// 주문 상태도 환불 완료로 변경
		Order order = payment.getOrder();
		order.updateStatus(OrderStatus.REFUNDED);
		orderService.updateOrder(order);

		log.info("환불 처리 완료 - 결제ID: {}, 주문ID: {}, 환불번호: {}",
			payment.getId(), order.getId(), refundNo);
	}

	/**
	 * 환불 가능 여부 확인
	 *
	 * @param payment 확인할 결제 정보
	 * @return 환불 가능 여부 (true: 가능, false: 불가능)
	 */
	private boolean isRefundable(Payment payment) {
		if (!PaymentStatus.DONE.equals(payment.getPaymentStatus())) {
			return false;
		}

		// 7일 시간 제한 확인
		LocalDateTime paymentDate = payment.getCreatedAt();
		return !paymentDate.isBefore(LocalDateTime.now().minusDays(7));
	}

	/**
	 * 환불 불가 사유 반환
	 *
	 * @param payment 확인할 결제 정보
	 * @return 환불 불가 사유 (환불 가능한 경우 null)
	 */
	private String getRefundUnavailableReason(Payment payment) {
		if (!PaymentStatus.DONE.equals(payment.getPaymentStatus())) {
			return "결제 완료된 건만 환불 가능합니다.";
		}

		LocalDateTime paymentDate = payment.getCreatedAt();
		if (paymentDate.isBefore(LocalDateTime.now().minusDays(7))) {
			return "환불 가능 기간(7일)이 지났습니다.";
		}

		return null;
	}
}
