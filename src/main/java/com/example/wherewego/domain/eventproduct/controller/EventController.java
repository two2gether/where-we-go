package com.example.wherewego.domain.eventproduct.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.eventproduct.service.EventService;

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

}
