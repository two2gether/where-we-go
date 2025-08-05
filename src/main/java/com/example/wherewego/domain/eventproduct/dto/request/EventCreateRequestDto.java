package com.example.wherewego.domain.eventproduct.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이벤트 생성 요청 DTO
 * 새로운 이벤트 상품을 생성할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventCreateRequestDto {
	/**
	 * 상품명
	 */
	@NotBlank(message = "상품명은 필수입니다.")
	private String productName;

	/**
	 * 상품 이미지 nullable
	 */
	private String productImage;

	/**
	 * 상품 설명
	 */
	@NotBlank(message = "상품 설명은 필수입니다.")
	private String description;

	/**
	 * 상품 가격(원)
	 */
	@NotNull(message = "상품 가격은 필수입니다.")
	@Min(0)
	private Integer price;

	/**
	 * 상품 재고 수
	 */
	@NotNull(message = "상품 재고는 필수입니다.")
	@Min(1)
	private Integer stock;
}
