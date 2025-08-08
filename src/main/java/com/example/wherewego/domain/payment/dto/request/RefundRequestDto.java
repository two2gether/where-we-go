package com.example.wherewego.domain.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 환불 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDto {
	
	/**
	 * 환불 사유 (필수, 최대 200자)
	 */
	@NotBlank(message = "환불 사유를 입력해주세요.")
	@Size(max = 200, message = "환불 사유는 최대 200자까지 입력 가능합니다.")
	private String refundReason;
	
	// 전액 환불만 지원하므로 환불 금액 필드 제거
}