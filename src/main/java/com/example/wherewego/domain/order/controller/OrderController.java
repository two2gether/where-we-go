package com.example.wherewego.domain.order.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.OrderCreateResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.mapper.OrderMapper;
import com.example.wherewego.domain.order.service.OrderService;
import com.example.wherewego.global.response.ApiResponse;

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
}
