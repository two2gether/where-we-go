package com.example.wherewego.domain.places.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.response.BookmarkCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.domain.places.dto.response.UserBookmarkListDto;
import com.example.wherewego.domain.places.entity.PlaceBookmark;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 장소 북마크 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceBookmarkService {

	private final PlaceBookmarkRepository placeBookmarkRepository;
	private final UserRepository userRepository;

	/**
	 * 북마크 추가
	 */
	@Transactional
	public BookmarkCreateResponseDto addBookmark(Long userId, String placeId) {
		log.debug("북마크 추가 - userId: {}, placeId: {}", userId, placeId);

		// 이미 북마크된 장소인지 확인
		if (placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)) {
			throw new CustomException(ErrorCode.BOOKMARK_ALREADY_EXISTS);
		}

		// 사용자 조회
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 북마크 생성
		PlaceBookmark bookmark = PlaceBookmark.builder()
			.user(user)
			.placeId(placeId)
			.build();

		PlaceBookmark savedBookmark = placeBookmarkRepository.save(bookmark);

		return BookmarkCreateResponseDto.builder()
			.bookmarkId(savedBookmark.getId())
			.isBookmarked(true)
			.build();
	}

	/**
	 * 사용자 북마크 목록 조회
	 */
	public UserBookmarkListDto getUserBookmarks(Long userId, int page, int size,
		Double userLatitude, Double userLongitude) {
		log.debug("사용자 북마크 목록 조회 - userId: {}, page: {}, size: {}", userId, page, size);

		Pageable pageable = PageRequest.of(page, size);
		Page<PlaceBookmark> bookmarkPage = placeBookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

		// 북마크된 장소들의 상세 정보를 외부 API에서 조회
		// TODO: 실제 구현에서는 카카오 API 호출 필요
		var bookmarkItems = bookmarkPage.getContent().stream()
			.map(bookmark -> {
				// 임시로 기본 PlaceDetailResponse 생성 (실제로는 카카오 API 호출)
				PlaceDetailResponse place = createDummyPlaceDetail(bookmark.getPlaceId(), userLatitude, userLongitude);

				return UserBookmarkListDto.BookmarkItem.builder()
					.bookmarkId(bookmark.getId())
					.place(place)
					.createdAt(bookmark.getCreatedAt())
					.build();
			})
			.toList();

		return UserBookmarkListDto.builder()
			.content(bookmarkItems)
			.totalElements(bookmarkPage.getTotalElements())
			.totalPages(bookmarkPage.getTotalPages())
			.size(bookmarkPage.getSize())
			.number(bookmarkPage.getNumber())
			.build();
	}

	/**
	 * 임시 장소 정보 생성 (실제로는 카카오 API 호출 필요)
	 */
	private PlaceDetailResponse createDummyPlaceDetail(String placeId, Double userLatitude, Double userLongitude) {
		// TODO: 실제 구현에서는 KakaoPlaceService를 통해 장소 정보 조회
		log.warn("임시 장소 정보 생성 - placeId: {}", placeId);

		return PlaceDetailResponse.builder()
			.placeId(placeId)
			.name("장소명 조회 필요")
			.category("카테고리 조회 필요")
			.regionSummary("지역 조회 필요")
			.address("주소 조회 필요")
			.latitude(37.5665)
			.longitude(126.9780)
			.averageRating(0.0)
			.reviewCount(0)
			.bookmarkCount(0)
			.isBookmarked(true)  // 북마크 목록이므로 항상 true
			.build();
	}
}