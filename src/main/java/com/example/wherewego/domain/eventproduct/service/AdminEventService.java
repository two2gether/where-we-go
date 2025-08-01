package com.example.wherewego.domain.eventproduct.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.events.EventException;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.eventproduct.dto.request.EventCreateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventCreateResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.mapper.EventMapper;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

/**
 * 이벤트 상품 관리자용 서비스
 * 이벤트 상품의 생성, 수정, 삭제 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class AdminEventService {

	private final EventRepository eventRepository;
	private final EventMapper eventMapper;
	private final UserRepository userRepository;

	/**
	 * 새로운 이벤트 상품을 생성합니다.
	 *
	 * @param requestDto 이벤트 상품 생성 요청 데이터 (상품명, 이미지, 설명, 가격, 상품 재고 수)
	 * @param userId 상품을 생성하는 사용자 ID (관리자)
	 * FIXME: 나중에 관리자 ID로 수정해야함
	 * @return 생성된 이벤트 정보를 담은 응답 DTO
	 * @throws EventException 관리자가 아닌 경우 또는 사용자를 찾을 수 없는 경우
	 */
	@Transactional
	public EventCreateResponseDto createEvent(
		EventCreateRequestDto requestDto,
		Long userId
	) {
		// 1. 사용자 조회 - userId로 사용자 정보 조회
		User user = userRepository.findByIdAndIsDeletedFalse(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 2. 관리자 권한 확인
		// if(!user.getRole().equals(UserRole.ADMIN)) {
		// 	throw new CustomException(ErrorCode.UNAUTHORIZED_EVENT_PRODUCT_ACCESS);
		// }

		// 3. [요청 DTO -> 엔티티 변환] - mapper 사용
		EventProduct product = eventMapper.toEntity(requestDto, user);

		// 4. 엔티티 DB에 저장
		EventProduct savedProduct = eventRepository.save(product);

		// 5. [저장된 엔티티 -> 응답 DTO 변환]
		return eventMapper.toDto(savedProduct);
	}
}
