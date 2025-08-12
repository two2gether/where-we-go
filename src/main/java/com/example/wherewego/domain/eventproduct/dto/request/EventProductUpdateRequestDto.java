package com.example.wherewego.domain.eventproduct.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이벤트 상품 수정 요청 DTO
 * 기존 상품의 정보를 수정할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventProductUpdateRequestDto {

	/**
	 * 상품명
	 */
	private String productName;

	/**
	 * 상품 이미지 nullable
	 */
	private String productImage;

	/**
	 * 상품 설명
	 */
	private String description;

	/**
	 * 상품 가격(원)
	 */
	@Min(0)
	private Integer price;

	/**
	 * 상품 재고 수
	 */
	@Min(1)
	private Integer stock;
}
