package com.example.wherewego.domain.eventproduct.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이벤트 상품 생성 응답 DTO
 * 새로운 이벤트 상품이 생성되었을 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventCreateResponseDto {
	/**
	 * 생성된 상품의 고유 식별자
	 */
	private Long productId;

	/**
	 * 상품 생성 일시
	 */
	private LocalDateTime createdAt;
}
