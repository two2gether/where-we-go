package com.example.wherewego.domain.eventproduct.mapper;

import com.example.wherewego.domain.eventproduct.dto.request.EventCreateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventCreateResponseDto;
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
}
