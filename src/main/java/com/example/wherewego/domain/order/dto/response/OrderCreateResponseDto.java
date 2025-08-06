package com.example.wherewego.domain.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 주문 생성 응답 DTO
 * 새로운 주문이 생성되었을 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderCreateResponseDto {
	/**
	 * 생성된 주문의 고유 식별자
	 */
	private Long orderId;

	/**
	 * 생성된 주문번호
	 */
	private String orderNo;
}
