package com.example.wherewego.domain.eventproduct.mapper;

import com.example.wherewego.domain.eventproduct.dto.request.EventCreateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventCreateResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventUpdateResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.user.entity.User;

public class EventMapper {
	// DTO → Entity
	public static EventProduct toEntity(EventCreateRequestDto request, User user) {
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
	public static EventCreateResponseDto toDto(EventProduct entity) {
		return EventCreateResponseDto.builder()
			.productId(entity.getId())
			.createdAt(entity.getCreatedAt())
			.build();
	}

	// Update Entity -> Response DTO
	public static EventUpdateResponseDto toUpdateDto(EventProduct eventProduct) {
		return EventUpdateResponseDto.builder()
			.productId(eventProduct.getId())
			.productName(eventProduct.getProductName())
			.productImage(eventProduct.getProductImage())
			.description(eventProduct.getDescription())
			.price(eventProduct.getPrice())
			.stock(eventProduct.getStock())
			.updatedAt(eventProduct.getUpdatedAt())
			.build();
	}
}
