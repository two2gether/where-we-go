package com.example.wherewego.domain.eventproduct.mapper;

import com.example.wherewego.domain.eventproduct.dto.request.EventProductCreateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductCreateResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductDetailResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductListResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductUpdateResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.user.entity.User;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class EventProductMapper {
	// DTO → Entity
	public static EventProduct toEntity(EventProductCreateRequestDto request, User user) {
		return EventProduct.builder()
			.productName(request.getProductName())
			.productImage(request.getProductImage())
			.description(request.getDescription())
			.price(request.getPrice())
			.stock(request.getStock())
			.user(user)
			.build();
	}

	// Entity → Response DTO
	public static EventProductCreateResponseDto toDto(EventProduct entity) {
		return EventProductCreateResponseDto.builder()
			.productId(entity.getId())
			.createdAt(entity.getCreatedAt())
			.build();
	}

	// Update Entity -> Response DTO
	public static EventProductUpdateResponseDto toUpdateDto(EventProduct eventProduct) {
		return EventProductUpdateResponseDto.builder()
			.productId(eventProduct.getId())
			.productName(eventProduct.getProductName())
			.productImage(eventProduct.getProductImage())
			.description(eventProduct.getDescription())
			.price(eventProduct.getPrice())
			.stock(eventProduct.getStock())
			.updatedAt(eventProduct.getUpdatedAt())
			.build();
	}

	// List Response DTO
	public static EventProductListResponseDto toListDto(EventProduct eventProduct) {
		return EventProductListResponseDto.builder()
			.productId(eventProduct.getId())
			.productName(eventProduct.getProductName())
			.productImage(eventProduct.getProductImage())
			.price(eventProduct.getPrice())
			.stock(eventProduct.getStock())
			.createdAt(eventProduct.getCreatedAt())
			.build();
	}

	// 상품 상세 조회 응답 DTO로 변환
	public static EventProductDetailResponseDto toDetailDto(EventProduct eventProduct) {
		return EventProductDetailResponseDto.builder()
			.productId(eventProduct.getId())
			.productName(eventProduct.getProductName())
			.productImage(eventProduct.getProductImage())
			.description(eventProduct.getDescription())
			.price(eventProduct.getPrice())
			.stock(eventProduct.getStock())
			.createdAt(eventProduct.getCreatedAt())
			.build();
	}
}
