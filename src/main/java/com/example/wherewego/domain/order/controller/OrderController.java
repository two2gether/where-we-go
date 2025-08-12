package com.example.wherewego.domain.order.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.OrderCreateResponseDto;
import com.example.wherewego.domain.order.dto.response.OrderDetailResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.mapper.OrderMapper;
import com.example.wherewego.domain.order.service.OrderService;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class OrderController {

	private final OrderService orderService;

	@PostMapping("/api/orders")
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<OrderCreateResponseDto> registerOrder(
		@RequestBody @Valid OrderCreateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		// 주문 생성 (엔티티 반환)
		Order order = orderService.createOrder(requestDto, userId);

		// 응답 DTO 변환
		OrderCreateResponseDto response = OrderMapper.toCreateResponseDto(order);

		return ApiResponse.created("주문이 생성되었습니다.", response);
	}

	/**
	 * 주문 상세 조회 (본인 주문만)
	 * @param orderId 주문 ID
	 * @param userDetail 인증된 사용자 정보
	 * @return 주문 상세 정보
	 */
	@GetMapping("/api/orders/{orderId}")
	public ApiResponse<OrderDetailResponseDto> getOrderDetail(
		@PathVariable Long orderId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		OrderDetailResponseDto orderDetail = orderService.getOrderDetail(orderId, userId);

		return ApiResponse.ok("주문 상세 정보를 조회했습니다.", orderDetail);
	}

	/**
	 * 주문 취소(삭제) API
	 *
	 * 주문을 취소합니다.
	 * 취소(삭제)된 주문은 더 이상 조회할 수 없으며, 관련 데이터도 함께 정리됩니다.
	 *
	 * @param orderId 삭제할 주문의 고유 ID
	 * @param userDetail 인증된 사용자 정보
	 * @return 빈 응답과 성공 메시지
	 */
	@DeleteMapping("/api/orders/{orderId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ApiResponse<Void> cancelOrder(
		@PathVariable Long orderId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		orderService.cancelOrder(orderId, userId);

		return ApiResponse.noContent("주문이 취소되었습니다.");
	}
}
