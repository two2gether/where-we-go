package com.example.wherewego.domain.eventproduct.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.eventproduct.dto.request.EventCreateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.request.EventUpdateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventCreateResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventUpdateResponseDto;
import com.example.wherewego.domain.eventproduct.service.AdminEventService;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 이벤트 상품 관리자용 REST API 컨트롤러
 *
 * 이벤트 상품의 생성, 수정, 삭제 기능을 제공합니다.
 * 페이지네이션, 사용자 및 권한 관리 기능을 포함합니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/event-products")
public class AdminEventController {

	private final AdminEventService adminEventService;

	/**
	 * 이벤트 상품을 생성합니다.
	 * 인증된 사용자만 사용 가능합니다.
	 *
	 * @param requestDto 이벤트 생성 요청 데이터
	 * @param userDetail 인증된 사용자 정보
	 * @return 생성된 이벤트 상품 정보를 포함한 API 응답
	 */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<EventCreateResponseDto> registerEvent(
		@RequestBody @Valid EventCreateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		EventCreateResponseDto response = adminEventService.createEvent(requestDto, userId);

		return ApiResponse.created("이벤트 상품이 등록되었습니다.", response);
	}

	/**
	 * 기존 상품의 정보를 수정합니다.
	 * 관리자만 수정할 수 있습니다.
	 *
	 * @param productId 수정할 상품 ID
	 * @param requestDto 수정할 상품 정보
	 * @param userDetail 인증된 사용자 정보
	 * @return 수정된 상품 정보를 포함한 API 응답
	 */
	@PatchMapping("/{productId}")
	public ApiResponse<EventUpdateResponseDto> updateEvent(
		@PathVariable Long productId,
		@RequestBody @Valid EventUpdateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		EventUpdateResponseDto response = adminEventService.updateEventInto(productId, requestDto, userId);

		return ApiResponse.ok("상품이 수정되었습니다.", response);
	}

	/**
	 * 이벤트 상품 삭제 API
	 *
	 * 기존 상품을 삭제합니다.
	 * 관리자만 삭제할 수 있으며, 권한 검증을 통해 보안을 보장합니다.
	 * 삭제된 상품은 더 이상 조회할 수 없으며, 관련 데이터도 함께 정리됩니다.
	 *
	 * @param productId 삭제할 상품의 고유 ID
	 * @param userDetail 인증된 사용자 정보 (관리자 권한 검증용)
	 * @return 빈 응답과 성공 메시지
	 */
	@DeleteMapping("/{productId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ApiResponse<Void> deleteEvent(
		@PathVariable Long productId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		adminEventService.deleteEventById(productId, userId);

		return ApiResponse.noContent("이벤트 상품이 삭제되었습니다.");
	}
}
