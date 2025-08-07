package com.example.wherewego.domain.order.mapper;

import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.OrderCreateResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.user.entity.User;

public class OrderMapper {

	// 결제 요청 DTO → 주문 엔티티
	public static Order toEntity(OrderCreateRequestDto requestDto, User user, EventProduct product, String orderNo,
		int totalPrice) {
		return Order.builder()
			.orderNo(orderNo)
			.user(user)
			.eventProduct(product)
			.quantity(requestDto.getQuantity())
			.totalPrice(totalPrice)
			.status(OrderStatus.PENDING)
			.build();
	}

	// 응답 DTO 변환용
	public static OrderCreateResponseDto toCreateResponseDto(Order order) {
		return new OrderCreateResponseDto(
			order.getId(),
			order.getOrderNo()
		);
	}

	public static OrderCreateRequestDto toOrderCreateRequestDto(PaymentRequestDto requestDto) {
		return OrderCreateRequestDto.builder()
			.productId(requestDto.getProductId())
			.quantity(requestDto.getQuantity())
			.build();
	}
}
