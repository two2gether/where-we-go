package com.example.wherewego.domain.places.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.places.dto.response.BookmarkCreateResponseDto;
import com.example.wherewego.domain.places.entity.PlaceBookmark;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;

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
			throw new IllegalArgumentException("이미 북마크된 장소입니다.");
		}

		// 사용자 조회
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

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
}