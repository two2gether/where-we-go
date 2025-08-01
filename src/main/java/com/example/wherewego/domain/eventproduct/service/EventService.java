package com.example.wherewego.domain.eventproduct.service;

import org.springframework.stereotype.Service;

import com.example.wherewego.domain.eventproduct.repository.EventRepository;

import lombok.RequiredArgsConstructor;

/**
 * 이벤트 상품 관리 서비스
 * 이벤트 상품의 목록 조회, 상세 조회 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class EventService {

	private final EventRepository eventRepository;

}
