package com.example.wherewego.domain.payment.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.payment.dto.request.CallbackRequestDto;
import com.example.wherewego.domain.payment.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentCallbackController {

	private final PaymentService paymentService;

	/**
	 * 토스 결제 완료 콜백을 처리합니다. (자동 승인)
	 *
	 * @param requestDto 토스페이에서 전달한 결제 완료 정보
	 * return(X) 서버에서는 HTTP 200 OK 만 반환하면 됨.
	 */
	@PostMapping("/callback")
	@ResponseStatus(HttpStatus.OK) // 200 OK만 반환
	public void paymentCallback(
		@RequestBody @Valid CallbackRequestDto requestDto
	) {
		log.info("🎉 토스페이 콜백 수신됨! orderNo: {}, status: {}", requestDto.getOrderNo(), requestDto.getStatus());
		log.info("콜백 데이터: {}", requestDto);
		
		// 비즈니스 로직 처리: 주문 상태 변경, 결제 정보 저장 등
		paymentService.processPaymentApproval(requestDto);
		
		log.info("✅ 콜백 처리 완료!");
	}
}
