package com.example.wherewego.domain.order.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.OrderCreateResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.mapper.OrderMapper;
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
	public OrderCreateResponseDto createOrder(OrderCreateRequestDto requestDto, Long userId) {

		// 1. 사용자 조회
		User user = userRepository.findByIdAndIsDeletedFalse(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 2. 상품 조회
		EventProduct product = eventRepository.findById(requestDto.getProductId())
			.orElseThrow(() -> new CustomException(ErrorCode.EVENT_PRODUCT_NOT_FOUND));

		// 3. 총 결제 금액 계산 (단가 × 수량)
		int totalPrice = product.getPrice() * requestDto.getQuantity();

		// 4. 주문 번호 생성
		String orderNo = UUID.randomUUID().toString();

		// 5. 매퍼로 Order 엔티티 생성
		Order order = OrderMapper.toEntity(requestDto, user, product, orderNo, totalPrice);

		// 6. 저장
		orderRepository.save(order);

		// 7. 매퍼로 응답 DTO 변환
		return OrderMapper.toCreateResponseDto(order);
	}
}
