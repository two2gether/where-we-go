package com.example.wherewego.domain.order.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

	private final UserRepository userRepository;
	private final OrderRepository orderRepository;
	private final EventRepository eventRepository;

	@Transactional
	public Order createOrder(OrderCreateRequestDto requestDto, Long userId) {

		// 1. 사용자 조회
		User user = userRepository.findByIdAndIsDeletedFalse(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 2. 상품 조회
		EventProduct product = eventRepository.findById(requestDto.getProductId())
			.orElseThrow(() -> new CustomException(ErrorCode.EVENT_PRODUCT_NOT_FOUND));

		// 3. 주문 번호 생성
		String orderNo = UUID.randomUUID().toString(); // 고유 주문번호 생성

		Order order = Order.builder()
			.orderNo(orderNo)
			.user(user)
			.eventProduct(product)
			.quantity(requestDto.getQuantity())
			.totalPrice(product.getPrice() * requestDto.getQuantity())
			.status(OrderStatus.PENDING)
			.build();

		return orderRepository.save(order);
	}
}
