package com.example.wherewego.domain.places.service;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.request.PlaceReviewCreateRequestDto;
import com.example.wherewego.domain.places.dto.request.PlaceReviewUpdateRequestDto;
import com.example.wherewego.domain.places.dto.response.PlaceReviewCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceReviewResponseDto;
import com.example.wherewego.domain.places.entity.PlaceReview;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 장소 리뷰 서비스
 *
 * 장소 리뷰 CRUD 및 비즈니스 로직을 처리합니다.
 * 사용자별 중복 리뷰 방지, 캐싱, 통계 업데이트 등을 담당합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceReviewService {

	private final PlaceReviewRepository placeReviewRepository;
	private final UserRepository userRepository;
	private final PlaceSearchService placeSearchService;

	/**
	 * 장소 리뷰 작성
	 *
	 * @param placeId 장소 ID
	 * @param requestDto 리뷰 작성 요청 데이터
	 * @param userId 작성자 ID
	 * @return 작성된 리뷰 정보
	 * @throws CustomException 이미 리뷰를 작성한 경우, 사용자를 찾을 수 없는 경우
	 */
	@CacheEvict(value = {"place-stats", "place-details"}, key = "#placeId")
	public PlaceReviewCreateResponseDto createReview(String placeId, PlaceReviewCreateRequestDto requestDto,
		Long userId) {
		log.info("장소 리뷰 작성 요청 - placeId: {}, userId: {}, rating: {}", placeId, userId, requestDto.getRating());

		// 1. 장소 존재 여부 검증 (트랜잭션 외부에서 수행)
		validatePlaceExists(placeId);

		// 2. 트랜잭션 내에서 리뷰 생성 처리
		return createReviewTransaction(placeId, requestDto, userId);
	}

	/**
	 * 장소 존재 여부 검증 (트랜잭션 외부)
	 */
	private void validatePlaceExists(String placeId) {
		if (placeSearchService.getPlaceDetail(placeId) == null) {
			log.warn("존재하지 않는 장소에 대한 리뷰 작성 시도 - placeId: {}", placeId);
			throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
		}
	}

	/**
	 * 리뷰 생성 트랜잭션 처리
	 */
	@Transactional
	protected PlaceReviewCreateResponseDto createReviewTransaction(String placeId, PlaceReviewCreateRequestDto requestDto,
		Long userId) {
		// 1. 중복 리뷰 검증
		if (placeReviewRepository.existsByUserIdAndPlaceId(userId, placeId)) {
			log.warn("이미 리뷰를 작성한 장소 - placeId: {}, userId: {}", placeId, userId);
			throw new CustomException(ErrorCode.REVIEW_ALREADY_EXISTS);
		}

		// 2. 사용자 조회
		User user = userRepository.findByIdAndIsDeletedFalse(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 3. 리뷰 엔티티 생성 및 저장
		PlaceReview review = PlaceReview.builder()
			.user(user)
			.placeId(placeId)
			.rating(requestDto.getRating())
			.content(requestDto.getContent())
			.build();

		PlaceReview savedReview = placeReviewRepository.save(review);
		log.info("장소 리뷰 작성 완료 - reviewId: {}", savedReview.getId());

		// 4. 응답 DTO 생성
		return PlaceReviewCreateResponseDto.builder()
			.reviewId(savedReview.getId())
			.rating(savedReview.getRating())
			.content(savedReview.getContent())
			.user(PlaceReviewCreateResponseDto.UserInfo.builder()
				.userId(user.getId())
				.nickname(user.getNickname())
				.profileImage(user.getProfileImage())
				.build())
			.createdAt(savedReview.getCreatedAt())
			.build();
	}

	/**
	 * 장소 리뷰 목록 조회 (페이징)
	 *
	 * @param placeId 장소 ID
	 * @param page 페이지 번호 (0부터 시작)
	 * @param size 페이지 크기
	 * @param currentUserId 현재 사용자 ID (null 가능)
	 * @return 페이징된 리뷰 목록
	 */
	@Cacheable(value = "place-reviews", key = "#placeId + '-' + #page + '-' + #size + '-' + (#currentUserId != null ? #currentUserId : 'guest')")
	public PagedResponse<PlaceReviewResponseDto> getPlaceReviews(String placeId, int page, int size,
		Long currentUserId) {
		log.info("장소 리뷰 목록 조회 - placeId: {}, page: {}, size: {}", placeId, page, size);

		Pageable pageable = PageRequest.of(page, size);
		Page<PlaceReview> reviewPage = placeReviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId, pageable);

		List<PlaceReviewResponseDto> reviewDtos = reviewPage.getContent().stream()
			.map(review -> convertToResponseDto(review, currentUserId))
			.toList();

		return new PagedResponse<>(reviewDtos, reviewPage.getTotalElements(),
			reviewPage.getTotalPages(), reviewPage.getSize(), reviewPage.getNumber());
	}

	/**
	 * 내 리뷰 수정
	 *
	 * @param placeId 장소 ID
	 * @param requestDto 수정 요청 데이터
	 * @param userId 사용자 ID
	 * @return 수정된 리뷰 정보
	 * @throws CustomException 리뷰를 찾을 수 없거나 권한이 없는 경우
	 */
	@Transactional
	@CacheEvict(value = {"place-stats", "place-details", "place-reviews"}, key = "#placeId")
	public PlaceReviewResponseDto updateMyReview(String placeId, PlaceReviewUpdateRequestDto requestDto, Long userId) {
		log.info("리뷰 수정 요청 - placeId: {}, userId: {}", placeId, userId);

		// 1. 내 리뷰 조회
		PlaceReview review = placeReviewRepository.findByUserIdAndPlaceId(userId, placeId)
			.orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

		// 2. 리뷰 수정
		review.updateReview(requestDto.getRating(), requestDto.getContent());
		PlaceReview updatedReview = placeReviewRepository.save(review);

		log.info("리뷰 수정 완료 - reviewId: {}", updatedReview.getId());

		return convertToResponseDto(updatedReview, userId);
	}

	/**
	 * 내 리뷰 삭제
	 *
	 * @param placeId 장소 ID
	 * @param userId 사용자 ID
	 * @throws CustomException 리뷰를 찾을 수 없거나 권한이 없는 경우
	 */
	@Transactional
	@CacheEvict(value = {"place-stats", "place-details", "place-reviews"}, key = "#placeId")
	public void deleteMyReview(String placeId, Long userId) {
		log.info("리뷰 삭제 요청 - placeId: {}, userId: {}", placeId, userId);

		PlaceReview review = placeReviewRepository.findByUserIdAndPlaceId(userId, placeId)
			.orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

		placeReviewRepository.delete(review);
		log.info("리뷰 삭제 완료 - reviewId: {}", review.getId());
	}

	/**
	 * 내가 작성한 리뷰 목록 조회
	 *
	 * @param userId 사용자 ID
	 * @param page 페이지 번호
	 * @param size 페이지 크기
	 * @return 페이징된 내 리뷰 목록
	 */
	@Cacheable(value = "user-reviews", key = "#userId + '-' + #page + '-' + #size")
	public PagedResponse<PlaceReviewResponseDto> getMyReviews(Long userId, int page, int size) {
		log.info("내 리뷰 목록 조회 - userId: {}, page: {}, size: {}", userId, page, size);

		Pageable pageable = PageRequest.of(page, size);
		Page<PlaceReview> reviewPage = placeReviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

		List<PlaceReviewResponseDto> reviewDtos = reviewPage.getContent().stream()
			.map(review -> convertToResponseDto(review, userId))
			.toList();

		return new PagedResponse<>(reviewDtos, reviewPage.getTotalElements(),
			reviewPage.getTotalPages(), reviewPage.getSize(), reviewPage.getNumber());
	}

	/**
	 * PlaceReview 엔티티를 ResponseDto로 변환
	 */
	private PlaceReviewResponseDto convertToResponseDto(PlaceReview review, Long currentUserId) {
		return PlaceReviewResponseDto.builder()
			.reviewId(review.getId())
			.placeId(review.getPlaceId())
			.reviewer(PlaceReviewResponseDto.ReviewerInfo.builder()
				.userId(review.getUser().getId())
				.nickname(review.getUser().getNickname())
				.profileImage(review.getUser().getProfileImage())
				.build())
			.rating(review.getRating())
			.content(review.getContent())
			.createdAt(review.getCreatedAt())
			.updatedAt(review.getUpdatedAt())
			.isMyReview(currentUserId != null && currentUserId.equals(review.getUser().getId()))
			.build();
	}

}