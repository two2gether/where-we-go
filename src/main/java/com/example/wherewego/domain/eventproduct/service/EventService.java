package com.example.wherewego.domain.eventproduct.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.eventproduct.dto.response.EventDetailResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventListResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.mapper.EventMapper;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

/**
 * 이벤트 상품 관리 서비스
 * 이벤트 상품의 목록 조회, 상세 조회 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class EventService {

	private final EventRepository eventRepository;

	/**
	 * 이벤트 상품 목록을 페이징하여 조회합니다.(삭제되지 않은 상품만)
	 *
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 페이징된 상품 목록 DTO
	 */
	public PagedResponse<EventListResponseDto> findAllEvents(Pageable pageable) {
		// 1. 리스트 조회 - 삭제되지 않은 상품만
		Page<EventProduct> eventPage = eventRepository.findAllByIsDeletedFalse(pageable);

		// 2. [엔티티 -> 응답 dto 변환]
		List<EventListResponseDto> eventListDto = eventPage.getContent().stream()
			.map(EventMapper::toListDto)
			.toList();

		// 3. PageImpl 로 Page 객체 생성
		Page<EventListResponseDto> dtoPage = new PageImpl<>(eventListDto, pageable, eventPage.getTotalElements());

		return PagedResponse.from(dtoPage);
	}

	/**
	 * 이벤트 상품 상세 정보를 조회하고 조회수를 증가시킵니다. (삭제되지 않은 상품만)
	 *
	 * @param productId 조회할 상품 ID
	 * @return 이벤트 상품 상세 정보
	 * @throws CustomException 상품을 찾을 수 없는 경우
	 */
	@Transactional
	public EventDetailResponseDto findEventById(Long productId) {
		// 1. 상품 조회
		EventProduct findProduct = eventRepository.findByIdAndIsDeletedFalse(productId)
			.orElseThrow(() -> new CustomException(ErrorCode.EVENT_PRODUCT_NOT_FOUND));

		// 2. 조회수 증가
		findProduct.incrementViewCount();

		// 3. [조회된 엔티티 -> 응답 DTO 변환]
		return EventMapper.toDetailDto(findProduct);
	}
}
