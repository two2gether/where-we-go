package com.example.wherewego.domain.payment.dto.response;

import java.time.LocalDateTime;

import com.example.wherewego.domain.common.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 환불 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponseDto {
	
	/**
	 * 결제 ID
	 */
	private Long paymentId;
	
	/**
	 * 주문 ID
	 */
	private Long orderId;
	
	/**
	 * 환불 금액 (전액)
	 */
	private Integer refundAmount;
	
	/**
	 * 환불 사유
	 */
	private String refundReason;
	
	/**
	 * 환불 상태
	 */
	private PaymentStatus refundStatus;
	
	/**
	 * 환불 완료 시간
	 */
	private LocalDateTime refundedAt;
}