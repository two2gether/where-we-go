package com.example.wherewego.domain.order.service;

import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventProductRepository;
import com.example.wherewego.domain.eventproduct.service.EventProductService;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.MyOrderResponseDto;
import com.example.wherewego.domain.order.dto.response.OrderCreateResponseDto;
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
	private final EventProductService eventProductService;
	private final EventProductRepository eventProductRepository;

	@Transactional
	public OrderCreateResponseDto createOrder(OrderCreateRequestDto requestDto, Long userId) {

		// 재주문 금지 대상
		Set<OrderStatus> blockedStatus = EnumSet.of(
			OrderStatus.PENDING,
			OrderStatus.READY,
			OrderStatus.DONE
		);
		if (orderRepository.existsByUserIdAndEventProductIdAndStatusIn(
			userId, requestDto.getProductId(), blockedStatus)) {
			throw new CustomException(ErrorCode.ORDER_ALREADY_EXISTS_FOR_USER);
		}

		// 1. 사용자 조회
		User user = userService.getUserById(userId);
		Long productId = requestDto.getProductId();
		int quantity = requestDto.getQuantity();

		// 2. Atomic Update 호출
		int updated = eventProductRepository.decreaseStockIfAvailable(productId, quantity);
		if (updated == 0) {
			throw new CustomException(ErrorCode.EVENT_PRODUCT_OUT_OF_STOCK);
		}

		// 3. 차감된 후 최신 상태 엔티티 조회
		EventProduct product = eventProductService.getEventProductById(productId);

		// 4. 주문 번호 생성
		String orderNo = UUID.randomUUID().toString(); // 고유 주문번호 생성

		// 5. 주문 생성
		Order order = Order.builder()
			.orderNo(orderNo)
			.user(user)
			.eventProduct(product)
			.quantity(requestDto.getQuantity())
			.totalPrice(product.getPrice() * requestDto.getQuantity())
			.status(OrderStatus.PENDING)
			.build();

		orderRepository.save(order);

		// 응답 DTO 변환
		return OrderMapper.toCreateResponseDto(order);
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

	/**
	 * 주문 번호로 주문 조회 (Payment 도메인에서 사용)
	 * @param orderNo 주문 번호
	 * @return 주문 엔티티
	 * @throws CustomException 주문을 찾을 수 없는 경우
	 */
	@Transactional(readOnly = true)
	public Order getOrderByOrderNo(String orderNo) {
		return orderRepository.findByOrderNo(orderNo)
			.orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
	}

	/**
	 * 주문 상태 업데이트 (Payment 도메인에서 사용)
	 * @param order 업데이트할 주문 엔티티
	 * @return 저장된 주문 엔티티
	 */
	@Transactional
	public Order updateOrder(Order order) {
		return orderRepository.save(order);
	}

	/**
	 * 주문을 취소(삭제)합니다.
	 *
	 * @param orderId 삭제할 주문 ID
	 * @param userId 삭제를 요청한 사용자 ID
	 * @throws CustomException 주문을 찾을 수 없거나 삭제 권한이 없는 경우
	 */
	@Transactional
	public void deletedOrderById(Long orderId, Long userId) {
		// 1. 주문 조회하기
		Order findOrder = orderRepository.findById(orderId)
			.orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

		// 2. 사용자 권한 체크
		if (!findOrder.getUser().getId().equals(userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_ORDER_ACCESS);
		}

		// 3. 삭제하기 (DB삭제)
		orderRepository.delete(findOrder);
	}
}
