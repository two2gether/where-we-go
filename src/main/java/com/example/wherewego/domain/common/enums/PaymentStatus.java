package com.example.wherewego.domain.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentStatus {
	// 기존 상태
	READY("결제 준비"),
	DONE("결제 완료"),
	FAILED("결제 실패"),
	
	// 환불 관련 상태 추가
	REFUND_REQUESTED("환불 요청"),
	REFUNDED("환불 완료"),
	REFUND_FAILED("환불 실패");

	private final String paymentStatusName;
}
