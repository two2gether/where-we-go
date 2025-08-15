package com.example.wherewego.domain.eventproduct.service;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductDetailResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductListResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.mapper.EventProductMapper;
import com.example.wherewego.domain.eventproduct.repository.EventProductRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

/**
 * 이벤트 상품 관리 서비스
 * 이벤트 상품의 목록 조회, 상세 조회 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class EventProductService {

	private final EventProductRepository eventProductRepository;
	private final RedisTemplate<String, String> redisTemplate;
	private static final String VIEW_COUNT_KEY = "view_count:eventProduct:";

	/**
	 * 이벤트 상품 목록을 페이징하여 조회합니다.(삭제되지 않은 상품만)
	 *
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 페이징된 상품 목록 DTO
	 */
	public PagedResponse<EventProductListResponseDto> findAllEvents(Pageable pageable) {
		// 1. 리스트 조회 - 삭제되지 않은 상품만
		Page<EventProduct> eventPage = eventProductRepository.findAllByIsDeletedFalse(pageable);

		// 2. [엔티티 -> 응답 dto 변환]
		List<EventProductListResponseDto> eventListDto = eventPage.getContent().stream()
			.map(EventProductMapper::toListDto)
			.toList();

		// 3. PageImpl 로 Page 객체 생성
		Page<EventProductListResponseDto> dtoPage = new PageImpl<>(eventListDto, pageable,
			eventPage.getTotalElements());

		return PagedResponse.from(dtoPage);
	}

	/**
	 * 이벤트 상품 상세 정보를 조회하고 조회수를 증가시킵니다. (삭제되지 않은 상품만)
	 *
	 * @param productId 조회할 상품 ID
	 * @return 이벤트 상품 상세 정보
	 * @throws CustomException 상품을 찾을 수 없는 경우
	 */
	@Transactional(readOnly = true)
	public EventProductDetailResponseDto findEventById(Long productId) {
		// 1. 상품 조회
		EventProduct findProduct = eventProductRepository.findByIdAndIsDeletedFalse(productId)
			.orElseThrow(() -> new CustomException(ErrorCode.EVENT_PRODUCT_NOT_FOUND));

		// 2. 조회수 증가 (Redis)
		redisTemplate.opsForValue().increment(VIEW_COUNT_KEY + productId);

		// 3. [조회된 엔티티 -> 응답 DTO 변환]
		return EventProductMapper.toDetailDto(findProduct);
	}

	/**
	 * 상품 존재 여부를 검증합니다. (조회수 증가 없음)
	 * 주문 생성 등에서 사용하는 내부 메서드입니다.
	 *
	 * @param productId 검증할 상품 ID
	 * @return 검증된 EventProduct 엔티티
	 * @throws CustomException 상품을 찾을 수 없는 경우
	 */
	public EventProduct getEventProductById(Long productId) {
		return eventProductRepository.findByIdAndIsDeletedFalse(productId)
			.orElseThrow(() -> new CustomException(ErrorCode.EVENT_PRODUCT_NOT_FOUND));
	}

	/**
	 * 10분마다 실행되어 Redis의 해당 상품의 누적 조회수를 DB에 반영합니다.
	 * Redis는 DB 업데이트 전까지 임시로 조회수를 쌓아두는 공간으로 활용됩니다.
	 */
	@Scheduled(cron = "0 */10 * * * *")
	@Transactional
	public void updateViewCountsToDB() {
		Set<String> keys = redisTemplate.keys(VIEW_COUNT_KEY + "*");

		if (keys.isEmpty()) {
			return; // 처리할 키가 없으면 즉시 종료
		}

		// 각 키를 순회하며 DB에 반영
		for (String key : keys) {
			String productIdStr = key.substring(VIEW_COUNT_KEY.length());
			Long productId = Long.parseLong(productIdStr);

			String viewCountStr = redisTemplate.opsForValue().get(key);
			if (viewCountStr == null) continue;

			long viewCountToAdd = Long.parseLong(viewCountStr);
			eventProductRepository.incrementViewCount(productId, viewCountToAdd);

			// DB에 성공적으로 반영된 키는 Redis에서 삭제하여 중복 반영을 방지
			redisTemplate.delete(key);
		}
	}
}
