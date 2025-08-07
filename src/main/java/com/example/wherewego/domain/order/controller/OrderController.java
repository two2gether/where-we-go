package com.example.wherewego.domain.order.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.MyOrderResponseDto;
import com.example.wherewego.domain.order.dto.response.OrderDetailResponseDto;
import com.example.wherewego.domain.order.dto.response.OrderCreateResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.mapper.OrderMapper;
import com.example.wherewego.domain.order.service.OrderService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderService orderService;

	@PostMapping
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
	 * 내 주문 목록 조회 (결제 완료된 주문만)
	 * @param userDetail 인증된 사용자 정보
	 * @param pageable 페이징 정보 (기본 10개, 최대 100개)
	 * @return 페이징된 내 주문 목록
	 */
	@GetMapping("/mypage")
	public ApiResponse<PagedResponse<MyOrderResponseDto>> getMyOrders(
		@AuthenticationPrincipal CustomUserDetail userDetail,
		@PageableDefault(size = 10) Pageable pageable
	) {
		Long userId = userDetail.getUser().getId();
		
		PagedResponse<MyOrderResponseDto> orders = orderService.getMyOrders(userId, pageable);
		
		return ApiResponse.ok("내 주문 목록을 조회했습니다.", orders);
	}
	
	/**
	 * 주문 상세 조회 (본인 주문만)
	 * @param orderId 주문 ID
	 * @param userDetail 인증된 사용자 정보
	 * @return 주문 상세 정보
	 */
	@GetMapping("/{orderId}")
	public ApiResponse<OrderDetailResponseDto> getOrderDetail(
		@PathVariable Long orderId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		
		OrderDetailResponseDto orderDetail = orderService.getOrderDetail(orderId, userId);
		
		return ApiResponse.ok("주문 상세 정보를 조회했습니다.", orderDetail);
	}
}
