package com.example.wherewego.domain.eventproduct.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이벤트 상품 리스트 응답 DTO
 * 이벤트 상품 목록을 조회할 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventProductListResponseDto {
	/**
	 * 이벤트 상품 고유 식별자
	 */
	private Long productId;

	/**
	 * 상품명
	 */
	private String productName;

	/**
	 * 상품 이미지
	 */
	private String productImage;

	/**
	 * 상품 가격(원)
	 */
	private Integer price;

	/**
	 * 상품 재고 수
	 */
	private Integer stock;

	/**
	 * 상품 생성 일시
	 */
	private LocalDateTime createdAt;
}
