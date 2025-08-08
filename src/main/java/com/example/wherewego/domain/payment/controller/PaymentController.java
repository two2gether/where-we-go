package com.example.wherewego.domain.payment.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.payment.dto.request.RefundRequestDto;
import com.example.wherewego.domain.payment.dto.response.PaymentDetailResponseDto;
import com.example.wherewego.domain.payment.dto.response.PaymentResponseDto;
import com.example.wherewego.domain.payment.dto.response.RefundResponseDto;
import com.example.wherewego.domain.payment.service.PaymentService;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

	private final PaymentService paymentService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<PaymentResponseDto> createPayment(
		@RequestBody @Valid PaymentRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		PaymentResponseDto response = paymentService.requestPayment(requestDto, userId);

		return ApiResponse.created("결제 페이지가 생성되었습니다.", response);
	}

	/**
	 * 특정 주문의 결제 상세 정보를 조회합니다.
	 * @param orderId 주문 ID
	 * @param userDetail 인증된 사용자 정보
	 * @return 결제 상세 정보
	 */
	@GetMapping("/{orderId}")
	public ApiResponse<PaymentDetailResponseDto> getPaymentDetail(
		@PathVariable Long orderId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		PaymentDetailResponseDto paymentDetail = paymentService.getPaymentDetail(orderId, userId);

		return ApiResponse.ok("결제 상세 정보를 조회했습니다.", paymentDetail);
	}

	/**
	 * 환불 요청 API
	 *
	 * @param orderId 주문 ID
	 * @param requestDto 환불 요청 정보
	 * @param userDetail 인증된 사용자 정보
	 * @return 환불 요청 결과
	 */
	@PostMapping("/{orderId}/refund")
	public ApiResponse<RefundResponseDto> requestRefund(
		@PathVariable Long orderId,
		@RequestBody @Valid RefundRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		RefundResponseDto response = paymentService.requestRefund(orderId, requestDto, userId);

		return ApiResponse.ok("환불 요청이 처리되었습니다.", response);
	}

}
