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
	private final GooglePlaceService googlePlaceService;

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
		var bookmarkItems = bookmarkPage.getContent().stream()
			.map(bookmark -> {
				// Google Places API를 통해 실제 장소 정보 조회
				PlaceDetailResponse place = getPlaceDetailFromApi(bookmark.getPlaceId(), userLatitude, userLongitude);

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
	 * Google Places API를 통해 장소 상세 정보 조회
	 */
	private PlaceDetailResponse getPlaceDetailFromApi(String placeId, Double userLatitude, Double userLongitude) {
		log.debug("장소 상세 정보 조회 - placeId: {}", placeId);
		

		// Google Places API를 통해 장소 정보 조회
		// 북마크 상태 설정 (북마크 목록이므로 항상 true)
		PlaceDetailResponse place = googlePlaceService.getPlaceDetail(placeId, true);

		if (place == null) {
			log.warn("장소 정보를 찾을 수 없음 - placeId: {}", placeId);
			throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
		}

		return place;
	}

	/**
	 * 북마크 제거
	 */
	@Transactional
	public void removeBookmark(Long userId, String placeId) {
		log.debug("북마크 제거 - userId: {}, placeId: {}", userId, placeId);

		// 북마크 존재 확인 및 조회
		PlaceBookmark bookmark = placeBookmarkRepository.findByUserIdAndPlaceId(userId, placeId)
			.orElseThrow(() -> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));

		// 북마크 삭제
		placeBookmarkRepository.delete(bookmark);
		log.info("북마크 제거 완료 - bookmarkId: {}", bookmark.getId());
	}

	/**
	 * 특정 사용자의 특정 장소 북마크 여부 확인
	 */
	public boolean isBookmarked(Long userId, String placeId) {
		return placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId);
	}
}