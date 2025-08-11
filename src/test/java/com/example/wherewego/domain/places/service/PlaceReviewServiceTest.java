package com.example.wherewego.domain.places.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

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

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.request.PlaceReviewCreateRequestDto;
import com.example.wherewego.domain.places.dto.request.PlaceReviewUpdateRequestDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceReviewCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceReviewResponseDto;
import com.example.wherewego.domain.places.entity.PlaceReview;
import com.example.wherewego.domain.places.repository.PlaceReviewRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlaceReviewService 테스트")
class PlaceReviewServiceTest {

	@Mock
	private PlaceReviewRepository placeReviewRepository;

	@Mock
	private UserRepository userRepository;

	@Mock
	private PlaceSearchService placeSearchService;

	@InjectMocks
	private PlaceReviewService placeReviewService;

	private User testUser;
	private final Long userId = 1L;
	private final String placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4";

	@BeforeEach
	void setUp() {
		testUser = User.builder()
			.id(userId)
			.nickname("테스트유저")
			.email("test@example.com")
			.profileImage("https://example.com/profile.jpg")
			.build();
	}

	@Nested
	@DisplayName("리뷰 작성")
	class CreateReview {

		private PlaceReviewCreateRequestDto createRequest;

		@BeforeEach
		void setUp() {
			createRequest = PlaceReviewCreateRequestDto.builder()
				.rating(5)
				.content("정말 좋은 장소입니다!")
				.build();
		}

		@Test
		@DisplayName("리뷰를 정상적으로 작성한다")
		void shouldCreateReview() {
			// given
			PlaceDetailResponseDto placeDetail = PlaceDetailResponseDto.builder()
				.placeId(placeId)
				.name("테스트 장소")
				.build();

			given(placeSearchService.getPlaceDetail(placeId)).willReturn(placeDetail);
			given(placeReviewRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(false);
			given(userRepository.findByIdAndIsDeletedFalse(userId)).willReturn(Optional.of(testUser));

			PlaceReview savedReview = PlaceReview.builder()
				.id(1L)
				.user(testUser)
				.placeId(placeId)
				.rating(5)
				.content("정말 좋은 장소입니다!")
				.build();
			given(placeReviewRepository.save(any(PlaceReview.class))).willReturn(savedReview);

			// when
			PlaceReviewCreateResponseDto result = placeReviewService.createReview(placeId, createRequest, userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getReviewId()).isEqualTo(1L);
			assertThat(result.getRating()).isEqualTo(5);
			assertThat(result.getContent()).isEqualTo("정말 좋은 장소입니다!");
			assertThat(result.getUser().getUserId()).isEqualTo(userId);
			assertThat(result.getUser().getNickname()).isEqualTo("테스트유저");

			verify(placeReviewRepository, times(1)).save(any(PlaceReview.class));
		}

		@Test
		@DisplayName("존재하지 않는 장소에 리뷰 작성 시 예외가 발생한다")
		void shouldThrowExceptionWhenPlaceNotFound() {
			// given
			given(placeSearchService.getPlaceDetail(placeId)).willReturn(null);

			// when & then
			assertThatThrownBy(() -> placeReviewService.createReview(placeId, createRequest, userId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.PLACE_NOT_FOUND);
		}

		@Test
		@DisplayName("이미 리뷰를 작성한 장소에 중복 리뷰 작성 시 예외가 발생한다")
		void shouldThrowExceptionWhenReviewAlreadyExists() {
			// given
			PlaceDetailResponseDto placeDetail = PlaceDetailResponseDto.builder()
				.placeId(placeId)
				.name("테스트 장소")
				.build();

			given(placeSearchService.getPlaceDetail(placeId)).willReturn(placeDetail);
			given(placeReviewRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(true);

			// when & then
			assertThatThrownBy(() -> placeReviewService.createReview(placeId, createRequest, userId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.REVIEW_ALREADY_EXISTS);
		}

		@Test
		@DisplayName("존재하지 않는 사용자로 리뷰 작성 시 예외가 발생한다")
		void shouldThrowExceptionWhenUserNotFound() {
			// given
			PlaceDetailResponseDto placeDetail = PlaceDetailResponseDto.builder()
				.placeId(placeId)
				.name("테스트 장소")
				.build();

			given(placeSearchService.getPlaceDetail(placeId)).willReturn(placeDetail);
			given(placeReviewRepository.existsByUserIdAndPlaceId(userId, placeId)).willReturn(false);
			given(userRepository.findByIdAndIsDeletedFalse(userId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> placeReviewService.createReview(placeId, createRequest, userId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
		}
	}

	@Nested
	@DisplayName("리뷰 목록 조회")
	class GetPlaceReviews {

		private final int page = 0;
		private final int size = 10;

		@Test
		@DisplayName("장소의 리뷰 목록을 정상적으로 조회한다")
		void shouldGetPlaceReviews() {
			// given
			User reviewer1 = User.builder()
				.id(2L)
				.nickname("리뷰어1")
				.profileImage("https://example.com/profile1.jpg")
				.build();

			User reviewer2 = User.builder()
				.id(3L)
				.nickname("리뷰어2")
				.profileImage("https://example.com/profile2.jpg")
				.build();

			PlaceReview review1 = PlaceReview.builder()
				.id(1L)
				.user(reviewer1)
				.placeId(placeId)
				.rating(5)
				.content("정말 좋아요!")
				.build();

			PlaceReview review2 = PlaceReview.builder()
				.id(2L)
				.user(reviewer2)
				.placeId(placeId)
				.rating(3)
				.content("그냥 보통이에요")
				.build();

			List<PlaceReview> reviews = Arrays.asList(review1, review2);
			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceReview> reviewPage = new PageImpl<>(reviews, pageable, 2);

			given(placeReviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId, pageable))
				.willReturn(reviewPage);

			// when
			PagedResponse<PlaceReviewResponseDto> result = placeReviewService.getPlaceReviews(placeId, page, size,
				userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getContent()).hasSize(2);
			assertThat(result.getTotalElements()).isEqualTo(2);
			assertThat(result.getTotalPages()).isEqualTo(1);

			PlaceReviewResponseDto firstReview = result.getContent().get(0);
			assertThat(firstReview.getReviewId()).isEqualTo(1L);
			assertThat(firstReview.getRating()).isEqualTo(5);
			assertThat(firstReview.getContent()).isEqualTo("정말 좋아요!");
			assertThat(firstReview.getReviewer().getNickname()).isEqualTo("리뷰어1");
			assertThat(firstReview.getIsMyReview()).isFalse();
		}

		@Test
		@DisplayName("내가 작성한 리뷰는 isMyReview가 true가 된다")
		void shouldMarkMyReviewAsTrue() {
			// given
			PlaceReview myReview = PlaceReview.builder()
				.id(1L)
				.user(testUser)
				.placeId(placeId)
				.rating(5)
				.content("내가 작성한 리뷰")
				.build();

			List<PlaceReview> reviews = Arrays.asList(myReview);
			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceReview> reviewPage = new PageImpl<>(reviews, pageable, 1);

			given(placeReviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId, pageable))
				.willReturn(reviewPage);

			// when
			PagedResponse<PlaceReviewResponseDto> result = placeReviewService.getPlaceReviews(placeId, page, size,
				userId);

			// then
			PlaceReviewResponseDto myReviewDto = result.getContent().get(0);
			assertThat(myReviewDto.getIsMyReview()).isTrue();
		}

		@Test
		@DisplayName("리뷰가 없는 경우 빈 목록을 반환한다")
		void shouldReturnEmptyListWhenNoReviews() {
			// given
			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceReview> emptyPage = new PageImpl<>(List.of(), pageable, 0);

			given(placeReviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId, pageable))
				.willReturn(emptyPage);

			// when
			PagedResponse<PlaceReviewResponseDto> result = placeReviewService.getPlaceReviews(placeId, page, size,
				userId);

			// then
			assertThat(result.getContent()).isEmpty();
			assertThat(result.getTotalElements()).isEqualTo(0);
		}
	}

	@Nested
	@DisplayName("리뷰 수정")
	class UpdateMyReview {

		private PlaceReviewUpdateRequestDto updateRequest;

		@BeforeEach
		void setUp() {
			updateRequest = PlaceReviewUpdateRequestDto.builder()
				.rating(5)
				.content("수정된 리뷰 내용입니다!")
				.build();
		}

		@Test
		@DisplayName("내 리뷰를 정상적으로 수정한다")
		void shouldUpdateMyReview() {
			// given
			PlaceReview existingReview = PlaceReview.builder()
				.id(1L)
				.user(testUser)
				.placeId(placeId)
				.rating(4)
				.content("기존 리뷰 내용")
				.build();

			given(placeReviewRepository.findByUserIdAndPlaceId(userId, placeId))
				.willReturn(Optional.of(existingReview));
			given(placeReviewRepository.save(any(PlaceReview.class))).willReturn(existingReview);

			// when
			PlaceReviewResponseDto result = placeReviewService.updateMyReview(placeId, updateRequest, userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getRating()).isEqualTo(5);
			assertThat(result.getContent()).isEqualTo("수정된 리뷰 내용입니다!");
			assertThat(result.getIsMyReview()).isTrue();

			verify(placeReviewRepository, times(1)).save(existingReview);
		}

		@Test
		@DisplayName("존재하지 않는 리뷰 수정 시 예외가 발생한다")
		void shouldThrowExceptionWhenReviewNotFound() {
			// given
			given(placeReviewRepository.findByUserIdAndPlaceId(userId, placeId))
				.willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> placeReviewService.updateMyReview(placeId, updateRequest, userId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.REVIEW_NOT_FOUND);
		}
	}

	@Nested
	@DisplayName("리뷰 삭제")
	class DeleteMyReview {

		@Test
		@DisplayName("내 리뷰를 정상적으로 삭제한다")
		void shouldDeleteMyReview() {
			// given
			PlaceReview existingReview = PlaceReview.builder()
				.id(1L)
				.user(testUser)
				.placeId(placeId)
				.rating(4)
				.content("삭제할 리뷰")
				.build();

			given(placeReviewRepository.findByUserIdAndPlaceId(userId, placeId))
				.willReturn(Optional.of(existingReview));

			// when
			placeReviewService.deleteMyReview(placeId, userId);

			// then
			verify(placeReviewRepository, times(1)).delete(existingReview);
		}

		@Test
		@DisplayName("존재하지 않는 리뷰 삭제 시 예외가 발생한다")
		void shouldThrowExceptionWhenReviewNotFoundForDelete() {
			// given
			given(placeReviewRepository.findByUserIdAndPlaceId(userId, placeId))
				.willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> placeReviewService.deleteMyReview(placeId, userId))
				.isInstanceOf(CustomException.class)
				.hasFieldOrPropertyWithValue("errorCode", ErrorCode.REVIEW_NOT_FOUND);
		}
	}

	@Nested
	@DisplayName("내 리뷰 목록 조회")
	class GetMyReviews {

		private final int page = 0;
		private final int size = 10;

		@Test
		@DisplayName("내 리뷰 목록을 정상적으로 조회한다")
		void shouldGetMyReviews() {
			// given
			PlaceReview myReview1 = PlaceReview.builder()
				.id(1L)
				.user(testUser)
				.placeId("place1")
				.rating(5)
				.content("첫 번째 리뷰")
				.build();

			PlaceReview myReview2 = PlaceReview.builder()
				.id(2L)
				.user(testUser)
				.placeId("place2")
				.rating(4)
				.content("두 번째 리뷰")
				.build();

			List<PlaceReview> reviews = Arrays.asList(myReview1, myReview2);
			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceReview> reviewPage = new PageImpl<>(reviews, pageable, 2);

			given(placeReviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable))
				.willReturn(reviewPage);

			// when
			PagedResponse<PlaceReviewResponseDto> result = placeReviewService.getMyReviews(userId, page, size);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getContent()).hasSize(2);
			assertThat(result.getTotalElements()).isEqualTo(2);

			// 모든 리뷰가 내 리뷰여야 함
			result.getContent().forEach(review -> {
				assertThat(review.getIsMyReview()).isTrue();
				assertThat(review.getReviewer().getUserId()).isEqualTo(userId);
			});
		}

		@Test
		@DisplayName("내 리뷰가 없는 경우 빈 목록을 반환한다")
		void shouldReturnEmptyListWhenNoMyReviews() {
			// given
			Pageable pageable = PageRequest.of(page, size);
			Page<PlaceReview> emptyPage = new PageImpl<>(List.of(), pageable, 0);

			given(placeReviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable))
				.willReturn(emptyPage);

			// when
			PagedResponse<PlaceReviewResponseDto> result = placeReviewService.getMyReviews(userId, page, size);

			// then
			assertThat(result.getContent()).isEmpty();
			assertThat(result.getTotalElements()).isEqualTo(0);
		}
	}
}