package com.example.wherewego.domain.order.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.MyOrderResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.mapper.OrderMapper;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

	private final UserRepository userRepository;
	private final OrderRepository orderRepository;
	private final EventRepository eventRepository;

	// @Transactional
	// public OrderCreateResponseDto createOrder(OrderCreateRequestDto requestDto, Long userId) {
	//
	// 	// 1. 사용자 조회
	// 	User user = userRepository.findByIdAndIsDeletedFalse(userId)
	// 		.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
	//
	// 	// 2. 상품 조회
	// 	EventProduct product = eventRepository.findById(requestDto.getProductId())
	// 		.orElseThrow(() -> new CustomException(ErrorCode.EVENT_PRODUCT_NOT_FOUND));
	//
	// 	// 3. 총 결제 금액 계산 (단가 × 수량)
	// 	int totalPrice = product.getPrice() * requestDto.getQuantity();
	//
	// 	// 4. 주문 번호 생성
	// 	String orderNo = UUID.randomUUID().toString();
	//
	// 	// 5. 매퍼로 Order 엔티티 생성
	// 	Order order = OrderMapper.toEntity(requestDto, user, product, orderNo, totalPrice);
	//
	// 	// 6. 저장
	// 	orderRepository.save(order);
	//
	// 	// 7. 매퍼로 응답 DTO 변환
	// 	return OrderMapper.toCreateResponseDto(order);
	// }

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
	
	/**
	 * 내 주문 목록 조회 (결제 완료된 주문만)
	 * @param userId 사용자 ID
	 * @param pageable 페이징 정보
	 * @return 페이징된 내 주문 목록
	 */
	@Transactional(readOnly = true)
	public PagedResponse<MyOrderResponseDto> getMyOrders(Long userId, Pageable pageable) {
		// 1. 사용자 존재 여부 및 상태 검증
		userRepository.findByIdAndIsDeletedFalse(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		
		// 2. 결제 완료된 주문만 조회 (N+1 방지를 위한 JOIN FETCH 사용)
		Page<Order> orders = orderRepository.findCompletedOrdersByUserId(userId, OrderStatus.DONE, pageable);
		
		// 3. DTO 변환
		Page<MyOrderResponseDto> orderDtos = orders.map(OrderMapper::toMyOrderResponseDto);
		
		return PagedResponse.from(orderDtos);
	}
}
