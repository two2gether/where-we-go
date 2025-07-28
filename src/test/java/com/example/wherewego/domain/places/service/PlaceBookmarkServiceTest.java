package com.example.wherewego.domain.places.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.response.BookmarkCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.domain.places.dto.response.UserBookmarkListDto;
import com.example.wherewego.domain.places.entity.PlaceBookmark;
import com.example.wherewego.domain.places.repository.PlaceBookmarkRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlaceBookmarkService 테스트")
class PlaceBookmarkServiceTest {

	@Mock
	private PlaceBookmarkRepository placeBookmarkRepository;

	@Mock
	private UserRepository userRepository;

	@Mock
	private GooglePlaceService googlePlaceService;

	@InjectMocks
	private PlaceBookmarkService placeBookmarkService;

	private User testUser;
	private final Long userId = 1L;
	private final String placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4";

	@BeforeEach
	void setUp() {
		testUser = User.builder()
			.id(userId)
			.nickname("테스트유저")
			.email("test@example.com")
			.build();
	}

	@Nested
	@DisplayName("북마크 추가")
	class AddBookmark {

		@Test
		@DisplayName("북마크를 정상적으로 추가한다")
		void addBookmarkSuccess() {
			// given
			given(placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(false);
			given(userRepository.findById(userId)).willReturn(Optional.of(testUser));

			PlaceBookmark savedBookmark = PlaceBookmark.builder()
				.id(1L)
				.user(testUser)
				.placeId(placeId)
				.build();
			given(placeBookmarkRepository.save(any(PlaceBookmark.class))).willReturn(savedBookmark);

			// when
			BookmarkCreateResponseDto result = placeBookmarkService.addBookmark(userId, placeId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getBookmarkId()).isEqualTo(1L);
			assertThat(result.getIsBookmarked()).isTrue();

			verify(placeBookmarkRepository, times(1)).save(any(PlaceBookmark.class));
		}

		@Test
		@DisplayName("이미 북마크된 장소를 추가하려고 하면 예외가 발생한다")
		void addBookmarkAlreadyExists() {
			// given
			given(placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(true);

			// when & then
			assertThatThrownBy(() -> placeBookmarkService.addBookmark(userId, placeId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOOKMARK_ALREADY_EXISTS);
		}

		@Test
		@DisplayName("존재하지 않는 사용자로 북마크를 추가하려고 하면 예외가 발생한다")
		void addBookmarkUserNotFound() {
			// given
			given(placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(false);
			given(userRepository.findById(userId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> placeBookmarkService.addBookmark(userId, placeId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
		}
	}

	@Nested
	@DisplayName("사용자 북마크 목록 조회")
	class GetUserBookmarks {

		private final Double userLat = 37.5665;
		private final Double userLng = 126.9780;
		private final int page = 0;
		private final int size = 10;

		@Test
		@DisplayName("사용자의 북마크 목록을 정상적으로 조회한다")
		void getUserBookmarksSuccess() {
			// given
			PlaceBookmark bookmark1 = PlaceBookmark.builder()
				.id(1L)
				.user(testUser)
				.placeId("place1")
				.build();
			// BaseEntity의 createdAt은 자동으로 설정되므로 별도 설정 불필요

			PlaceBookmark bookmark2 = PlaceBookmark.builder()
				.id(2L)
				.user(testUser)
				.placeId("place2")
				.build();
			// BaseEntity의 createdAt은 자동으로 설정되므로 별도 설정 불필요

			List<PlaceBookmark> bookmarks = Arrays.asList(bookmark2, bookmark1); // 최신순
			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceBookmark> bookmarkPage = new PageImpl<>(bookmarks, pageable, 2);

			given(placeBookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable))
				.willReturn(bookmarkPage);

			PlaceDetailResponse place1 = PlaceDetailResponse.builder()
				.placeId("place2")
				.name("장소2")
				.category("카페")
				.latitude(37.5700)
				.longitude(126.9800)
				.isBookmarked(true)
				.build();

			PlaceDetailResponse place2 = PlaceDetailResponse.builder()
				.placeId("place1")
				.name("장소1")
				.category("음식점")
				.latitude(37.5750)
				.longitude(126.9850)
				.isBookmarked(true)
				.build();

			given(googlePlaceService.getPlaceDetail("place2")).willReturn(place1);
			given(googlePlaceService.getPlaceDetail("place1")).willReturn(place2);

			// when
			UserBookmarkListDto result = placeBookmarkService.getUserBookmarks(userId, page, size, userLat, userLng);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getContent()).hasSize(2);
			assertThat(result.getTotalElements()).isEqualTo(2);
			assertThat(result.getTotalPages()).isEqualTo(1);
			assertThat(result.getNumber()).isEqualTo(0);
			assertThat(result.getSize()).isEqualTo(10);

			// 첫 번째 북마크 (최신)
			UserBookmarkListDto.BookmarkItem firstItem = result.getContent().get(0);
			assertThat(firstItem.getBookmarkId()).isEqualTo(2L);
			assertThat(firstItem.getPlace().getPlaceId()).isEqualTo("place2");
			assertThat(firstItem.getPlace().getName()).isEqualTo("장소2");
			assertThat(firstItem.getPlace().getIsBookmarked()).isTrue();

			// 두 번째 북마크
			UserBookmarkListDto.BookmarkItem secondItem = result.getContent().get(1);
			assertThat(secondItem.getBookmarkId()).isEqualTo(1L);
			assertThat(secondItem.getPlace().getPlaceId()).isEqualTo("place1");
			assertThat(secondItem.getPlace().getName()).isEqualTo("장소1");
			assertThat(secondItem.getPlace().getIsBookmarked()).isTrue();
		}

		@Test
		@DisplayName("북마크가 없는 경우 빈 목록을 반환한다")
		void getUserBookmarksEmpty() {
			// given
			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceBookmark> emptyPage = new PageImpl<>(List.of(), pageable, 0);

			given(placeBookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable))
				.willReturn(emptyPage);

			// when
			UserBookmarkListDto result = placeBookmarkService.getUserBookmarks(userId, page, size, userLat, userLng);

			// then
			assertThat(result.getContent()).isEmpty();
			assertThat(result.getTotalElements()).isEqualTo(0);
		}

		@Test
		@DisplayName("장소 정보 조회 실패 시 CustomException이 발생한다")
		void getUserBookmarksPlaceNotFound() {
			// given
			PlaceBookmark bookmark = PlaceBookmark.builder()
				.id(1L)
				.user(testUser)
				.placeId("invalid-place")
				.build();
			// BaseEntity의 createdAt은 자동으로 설정되므로 별도 설정 불필요

			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceBookmark> bookmarkPage = new PageImpl<>(List.of(bookmark), pageable, 1);

			given(placeBookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable))
				.willReturn(bookmarkPage);
			given(googlePlaceService.getPlaceDetail("invalid-place")).willReturn(null);

			// when & then
			assertThatThrownBy(() -> placeBookmarkService.getUserBookmarks(userId, page, size, userLat, userLng))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.PLACE_NOT_FOUND);
		}

		@Test
		@DisplayName("외부 API 오류 시 CustomException이 발생한다")
		void getUserBookmarksApiError() {
			// given
			PlaceBookmark bookmark = PlaceBookmark.builder()
				.id(1L)
				.user(testUser)
				.placeId("place1")
				.build();
			// BaseEntity의 createdAt은 자동으로 설정되므로 별도 설정 불필요

			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceBookmark> bookmarkPage = new PageImpl<>(List.of(bookmark), pageable, 1);

			given(placeBookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable))
				.willReturn(bookmarkPage);
			given(googlePlaceService.getPlaceDetail("place1"))
				.willThrow(new RuntimeException("API 오류"));

			// when & then
			assertThatThrownBy(() -> placeBookmarkService.getUserBookmarks(userId, page, size, userLat, userLng))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.PLACE_API_ERROR);
		}
	}

	@Nested
	@DisplayName("북마크 제거")
	class RemoveBookmark {

		@Test
		@DisplayName("북마크를 정상적으로 제거한다")
		void removeBookmarkSuccess() {
			// given
			PlaceBookmark bookmark = PlaceBookmark.builder()
				.id(1L)
				.user(testUser)
				.placeId(placeId)
				.build();

			given(placeBookmarkRepository.findByUserIdAndPlaceId(userId, placeId))
				.willReturn(Optional.of(bookmark));

			// when
			placeBookmarkService.removeBookmark(userId, placeId);

			// then
			verify(placeBookmarkRepository, times(1)).delete(bookmark);
		}

		@Test
		@DisplayName("존재하지 않는 북마크를 제거하려고 하면 예외가 발생한다")
		void removeBookmarkNotFound() {
			// given
			given(placeBookmarkRepository.findByUserIdAndPlaceId(userId, placeId))
				.willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> placeBookmarkService.removeBookmark(userId, placeId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOOKMARK_NOT_FOUND);
		}
	}

	@Nested
	@DisplayName("북마크 여부 확인")
	class IsBookmarked {

		@Test
		@DisplayName("북마크가 존재하면 true를 반환한다")
		void isBookmarkedTrue() {
			// given
			given(placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(true);

			// when
			boolean result = placeBookmarkService.isBookmarked(userId, placeId);

			// then
			assertThat(result).isTrue();
		}

		@Test
		@DisplayName("북마크가 존재하지 않으면 false를 반환한다")
		void isBookmarkedFalse() {
			// given
			given(placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(false);

			// when
			boolean result = placeBookmarkService.isBookmarked(userId, placeId);

			// then
			assertThat(result).isFalse();
		}
	}
}