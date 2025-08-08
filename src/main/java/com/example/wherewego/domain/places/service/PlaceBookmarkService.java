package com.example.wherewego.domain.places.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.response.BookmarkCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;
import com.example.wherewego.domain.places.dto.response.UserBookmarkListDto;
import com.example.wherewego.domain.places.entity.PlaceBookmark;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

import lombok.extern.slf4j.Slf4j;

/**
 * 장소 북마크 관리 서비스
 * 사용자의 장소 북마크 추가, 삭제, 조회 및 북마크 상태 확인 기능을 제공합니다.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class PlaceBookmarkService {

	private final PlaceBookmarkRepository placeBookmarkRepository;
	private final UserService userService;
	private final PlaceSearchService placeSearchService;
	private final PlaceService placeService;

	/**
	 * PlaceBookmarkService 생성자
	 *
	 * @param placeBookmarkRepository 장소 북마크 관련 데이터베이스 접근 객체
	 * @param userService 사용자 관련 서비스 
	 * @param placeSearchService 장소 검색 서비스 (구글 Places API 사용)
	 * @param placeService 장소 서비스 (통계 정보 포함)
	 */
	public PlaceBookmarkService(PlaceBookmarkRepository placeBookmarkRepository, UserService userService,
		@Qualifier("googlePlaceService") PlaceSearchService placeSearchService, PlaceService placeService) {
		this.placeBookmarkRepository = placeBookmarkRepository;
		this.userService = userService;
		this.placeSearchService = placeSearchService;
		this.placeService = placeService;
	}

	/**
	 * 사용자가 특정 장소를 북마크에 추가합니다.
	 * 이미 북마크된 장소인 경우 예외를 발생시키며, 성공 시 북마크 ID를 반환합니다.
	 *
	 * @param userId 북마크를 추가할 사용자 ID
	 * @param placeId 북마크할 장소 ID
	 * @return 북마크 생성 결과 (북마크 ID 및 상태 포함)
	 * @throws CustomException 이미 북마크된 장소이거나 사용자를 찾을 수 없는 경우
	 */
	@Transactional
	@CacheEvict(value = "place-stats", allEntries = true)
	public BookmarkCreateResponseDto addBookmark(Long userId, String placeId) {

		// 이미 북마크된 장소인지 확인
		if (placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)) {
			throw new CustomException(ErrorCode.BOOKMARK_ALREADY_EXISTS);
		}

		// 사용자 조회
		User user = userService.getUserById(userId);

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
	 * 사용자의 북마크 목록을 페이지단위로 조회합니다.
	 * 각 북마크에 대해 외부 API를 통해 실시간 장소 정보를 가져오며, 생성일 순으로 정렬됩니다.
	 *
	 * @param userId 북마크 목록을 조회할 사용자 ID
	 * @param page 페이지 번호 (0부터 시작)
	 * @param size 페이지당 아이템 수
	 * @param userLatitude 사용자 위치 위도 (거리 계산용, null 가능)
	 * @param userLongitude 사용자 위치 경도 (거리 계산용, null 가능)
	 * @return 페이지네이션 정보와 북마크 목록
	 */
	public UserBookmarkListDto getUserBookmarks(Long userId, int page, int size,
		Double userLatitude, Double userLongitude) {

		Pageable pageable = PageRequest.of(page, size);
		Page<PlaceBookmark> bookmarkPage = placeBookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

		// 북마크된 장소들의 상세 정보를 통계 정보와 함께 조회
		var bookmarkItems = bookmarkPage.getContent().stream()
			.map(bookmark -> {
				// PlaceService를 통해 통계 정보가 포함된 장소 정보 조회 (캐시 활용)
				PlaceDetailResponseDto place = getPlaceDetailWithStats(bookmark.getPlaceId(), userId, userLatitude,
					userLongitude);

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
	 * PlaceService를 통해 북마크된 장소의 상세 정보를 통계와 함께 조회합니다.
	 * 캐시를 활용하여 성능을 최적화하고, 리뷰수/평점/북마크수 등 통계 정보를 포함합니다.
	 * 북마크 목록에서 호출되므로 북마크 상태는 항상 true로 설정됩니다.
	 *
	 * @param placeId 조회할 장소 ID
	 * @param userId 사용자 ID
	 * @param userLatitude 사용자 위치 위도 (거리 계산용, null 가능)
	 * @param userLongitude 사용자 위치 경도 (거리 계산용, null 가능)
	 * @return 통계 정보와 북마크 상태가 설정된 장소 상세 정보
	 * @throws CustomException 장소를 찾을 수 없는 경우
	 */
	private PlaceDetailResponseDto getPlaceDetailWithStats(String placeId, Long userId, Double userLatitude, Double userLongitude) {

		// PlaceService를 통해 통계 정보가 포함된 장소 정보 조회 (캐시 활용)
		PlaceDetailResponseDto place = placeService.getPlaceDetailWithStats(placeId, userId);

		if (place == null) {
			throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
		}

		// 북마크 상태 설정 (북마크 목록이므로 항상 true)
		return place.toBuilder()
			.isBookmarked(true)
			.build();
	}

	/**
	 * 사용자의 특정 장소 북마크를 제거합니다.
	 * 북마크가 존재하지 않는 경우 예외를 발생시킵니다.
	 *
	 * @param userId 북마크를 제거할 사용자 ID
	 * @param placeId 북마크를 제거할 장소 ID
	 * @throws CustomException 북마크를 찾을 수 없는 경우
	 */
	@Transactional
	@CacheEvict(value = "place-stats", allEntries = true)
	public void removeBookmark(Long userId, String placeId) {

		// 북마크 존재 확인 및 조회
		PlaceBookmark bookmark = placeBookmarkRepository.findByUserIdAndPlaceId(userId, placeId)
			.orElseThrow(() -> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));

		// 북마크 삭제
		placeBookmarkRepository.delete(bookmark);
	}

	/**
	 * 사용자가 특정 장소를 북마크했는지 확인합니다.
	 * 단순한 boolean 값을 반환하여 북마크 상태를 빠르게 확인할 수 있습니다.
	 *
	 * @param userId 확인할 사용자 ID
	 * @param placeId 확인할 장소 ID
	 * @return 북마크 여부 (true: 북마크됨, false: 북마크 안됨)
	 */
	public boolean isBookmarked(Long userId, String placeId) {
		return placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId);
	}
}