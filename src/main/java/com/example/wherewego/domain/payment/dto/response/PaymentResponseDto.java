package com.example.wherewego.domain.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {

	/**
	 * 응답 코드 (0: 성공, -1: 실패)
	 */
	private Integer code;
	/**
	 * 결제 페이지 URL (프론트에서 사용자가 결제할 페이지로 이동할 주소)
	 */
	private String checkoutPage;

	/**
	 * 결제 토큰 (결제 식별용, 저장 필요)
	 */
	private String payToken;

	/**
	 * 실패 시 메시지 (예: "요청한 값이 바르지 않습니다.")
	 */
	private String msg;

	/**
	 * 실패 시 에러 코드 (예: "TOSS_PAYMENT_FAILED")
	 */
	private String errorCode;
}
