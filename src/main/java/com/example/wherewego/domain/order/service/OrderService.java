package com.example.wherewego.domain.order.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.service.EventService;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.MyOrderResponseDto;
import com.example.wherewego.domain.order.dto.response.OrderDetailResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.mapper.OrderMapper;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

	private final UserService userService;
	private final OrderRepository orderRepository;
	private final EventService eventService;

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

		// 1. 사용자 검증
		User user = userService.getUserById(userId);

		// 2. 상품 검증
		EventProduct product = eventService.getEventProductById(requestDto.getProductId());

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
	 * 내 주문 목록 조회 (상태별 필터링 가능)
	 * @param userId 사용자 ID
	 * @param pageable 페이징 정보
	 * @param status 주문 상태 (null이면 모든 상태)
	 * @return 페이징된 내 주문 목록
	 */
	@Transactional(readOnly = true)
	public PagedResponse<MyOrderResponseDto> getMyOrders(Long userId, Pageable pageable, OrderStatus status) {
		// 1. 사용자 검증
		userService.getUserById(userId);
		
		// 2. 상태별 주문 조회 (N+1 방지를 위한 JOIN FETCH 사용)
		Page<Order> orders;
		if (status != null) {
			// 특정 상태만 조회
			orders = orderRepository.findOrdersByUserIdAndStatus(userId, status, pageable);
		} else {
			// 모든 상태 조회
			orders = orderRepository.findOrdersByUserId(userId, pageable);
		}
		
		// 3. DTO 변환
		Page<MyOrderResponseDto> orderDtos = orders.map(OrderMapper::toMyOrderResponseDto);
		
		return PagedResponse.from(orderDtos);
	}
	
	/**
	 * 내 주문 목록 조회 (결제 완료된 주문만) - 하위 호환성을 위한 오버로드
	 * @param userId 사용자 ID
	 * @param pageable 페이징 정보
	 * @return 페이징된 내 주문 목록
	 */
	@Transactional(readOnly = true)
	public PagedResponse<MyOrderResponseDto> getMyOrders(Long userId, Pageable pageable) {
		return getMyOrders(userId, pageable, OrderStatus.DONE);
	}
	
	/**
	 * 주문 상세 조회 (본인 주문만)
	 * @param orderId 주문 ID
	 * @param userId 사용자 ID
	 * @return 주문 상세 정보
	 */
	@Transactional(readOnly = true)
	public OrderDetailResponseDto getOrderDetail(Long orderId, Long userId) {
		// 1. 사용자 검증
		userService.getUserById(userId);
		
		// 2. 본인 주문만 조회 (N+1 방지를 위한 JOIN FETCH 사용)
		Order order = orderRepository.findByIdAndUserId(orderId, userId)
			.orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
		
		// 3. DTO 변환
		return OrderMapper.toOrderDetailResponseDto(order);
	}
}
