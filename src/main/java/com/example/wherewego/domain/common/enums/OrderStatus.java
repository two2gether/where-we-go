package com.example.wherewego.domain.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderStatus {
	// 기존 상태
	PENDING("결제 대기중"),
	READY("결제 준비완료"),
	DONE("결제 성공"),
	FAILED("결제 실패"),

	// 환불 관련 상태 추가
	REFUNDED("환불 완료"),

	// 결제 시간 초과 상태 추가
	CANCELED("미결제");

	private final String orderStatusName;
}
