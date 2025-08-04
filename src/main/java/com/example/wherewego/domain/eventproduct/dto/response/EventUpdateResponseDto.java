package com.example.wherewego.domain.eventproduct.dto.response;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이벤트 상품 수정 응답 DTO
 * 기존 이벤트 상품이 수정되었을 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventUpdateResponseDto {
	/**
	 * 수정된 상품의 고유 식별자
	 */
	private Long productId;
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

	/**
	 * 이벤트 상품 수정 일시
	 */
	private LocalDateTime updatedAt;
}
