package com.example.wherewego.domain.eventproduct.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.eventproduct.dto.response.EventListResponseDto;
import com.example.wherewego.domain.eventproduct.service.EventService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

/**
 * 이벤트 상품 REST API 컨트롤러
 *
 * 이벤트 상품의 목록 조회, 상세 조회 기능을 제공합니다.
 * 모든 사용자(관리자 포함)가 사용 가능하며, 페이지네이션 기능을 포함합니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/event-products")
public class EventController {

	private final EventService eventService;

	/**
	 * 이벤트 상품 목록을 페이징하여 조회합니다.
	 *
	 * @param pageable 페이징 정보 (기본: 10개씩, 생성일 내림차순)
	 * @return 페이징된 핫딜 상품 목록과 메타데이터
	 */
	@GetMapping
	public ApiResponse<PagedResponse<EventListResponseDto>> getEventList(
		@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		PagedResponse<EventListResponseDto> response = eventService.findAllEvents(pageable);

		return ApiResponse.ok("이벤트 상품 목록 조회를 성공했습니다.", response);
	}
}
