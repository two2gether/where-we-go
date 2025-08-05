package com.example.wherewego.domain.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderStatus {
	PENDING("결제 대기중"),
	READY("결제 준비완료"),
	DONE("결제 성공"),
	FAILED("결제 실패");

	private final String OrderStatusName;
}
