package com.example.wherewego.domain.course.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.lang.reflect.Field;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.auth.enums.Provider;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CourseRatingRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseRatingResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseRating;
import com.example.wherewego.domain.courses.repository.CourseRatingRepository;
import com.example.wherewego.domain.courses.service.CourseRatingService;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.courses.service.CourseStatisticsService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

/**
 * CourseRatingService 단위 테스트
 *
 * 테스트 범위:
 * - 평점 등록 (성공/실패 시나리오)
 * - 평점 삭제 (성공/실패 시나리오)
 * - 입력 데이터 유효성 검증
 * - 비즈니스 로직 검증 (중복 방지, 통계 업데이트)
 * - 예외 처리 검증
 */
@ExtendWith(MockitoExtension.class)
class CourseCourseRatingServiceTest {

	@Mock
	private CourseRatingRepository ratingRepository;

	@Mock
	private UserService userService;

	@Mock
	private CourseService courseService;

	@Mock
	private CourseStatisticsService statisticsService;

	@InjectMocks
	private CourseRatingService courseRatingService;

	private User testUser;
	private Course testCourse;
	private CourseRatingRequestDto validRatingRequest;
	private CourseRating testCourseRating;

	@BeforeEach
	void setUp() {
		// 테스트용 사용자 생성
		testUser = User.builder()
			.id(1L)
			.email("test@example.com")
			.nickname("테스터")
			.password("encodedPassword")
			.provider(Provider.LOCAL)
			.build();

		// 테스트용 코스 생성
		testCourse = Course.builder()
			.id(1L)
			.title("서울 가을 여행")
			.region("서울")
			.description("단풍 명소 투어")
			.isPublic(true)
			.user(testUser)
			.ratingSum(10.0)  // 기존 평점 합계 (예: 5점 2개)
			.ratingCount(2)   // 기존 평점 개수
			.averageRating(5.0) // 기존 평균 평점
			.build();

		// 유효한 평점 등록 요청
		validRatingRequest = new CourseRatingRequestDto(4);

		// 테스트용 평점 엔티티
		testCourseRating = new CourseRating(testUser, testCourse, 4);
		// Reflection으로 ID 설정 (테스트용) - 응답 DTO 생성에 필요
		try {
			Field idField = CourseRating.class.getDeclaredField("id");
			idField.setAccessible(true);
			idField.set(testCourseRating, 1L);
		} catch (Exception e) {
			throw new RuntimeException("테스트 설정 실패: Rating ID 설정 불가", e);
		}
	}

	@Nested
	@DisplayName("평점 등록 테스트")
	class CreateCourseRatingTest {

		@Test
		@DisplayName("정상 평점 등록 성공")
		void shouldCreateRating() {
			// given
			Long userId = 1L;
			Long courseId = 1L;

			when(courseService.getCourseById(courseId)).thenReturn(testCourse);
			when(userService.getUserById(userId)).thenReturn(testUser);
			when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
			when(ratingRepository.save(any(CourseRating.class))).thenReturn(testCourseRating);

			// when
			CourseRatingResponseDto result = courseRatingService.createCourseRating(userId, courseId,
				validRatingRequest);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getUserId()).isEqualTo(userId);
			assertThat(result.getCourseId()).isEqualTo(courseId);
			assertThat(result.getRating()).isEqualTo(4);

			verify(courseService).getCourseById(courseId);
			verify(userService).getUserById(userId);
			verify(ratingRepository).existsByUserIdAndCourseId(userId, courseId);
			verify(ratingRepository).save(any(CourseRating.class));
			verify(statisticsService).addRating(testCourse, 4.0);
		}

		@Test
		@DisplayName("중복 평점 등록 시 예외 발생")
		void shouldThrowExceptionWhenRatingAlreadyExists() {
			// given
			Long userId = 1L;
			Long courseId = 1L;

			when(courseService.getCourseById(courseId)).thenReturn(testCourse);
			when(userService.getUserById(userId)).thenReturn(testUser);
			when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(true);

			// when & then
			assertThatThrownBy(() -> courseRatingService.createCourseRating(userId, courseId, validRatingRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.RATING_ALREADY_EXISTS.getMessage());

			verify(ratingRepository).existsByUserIdAndCourseId(userId, courseId);
			verify(ratingRepository, never()).save(any());
			verify(statisticsService, never()).addRating(any(), any());
		}

		@Test
		@DisplayName("존재하지 않는 코스로 평점 등록 시 예외 발생")
		void shouldThrowExceptionWhenCourseNotFound() {
			// given
			Long userId = 1L;
			Long nonExistentCourseId = 999L;

			when(courseService.getCourseById(nonExistentCourseId))
				.thenThrow(new CustomException(ErrorCode.COURSE_NOT_FOUND));

			// when & then
			assertThatThrownBy(
				() -> courseRatingService.createCourseRating(userId, nonExistentCourseId, validRatingRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.COURSE_NOT_FOUND.getMessage());

			verify(courseService).getCourseById(nonExistentCourseId);
			verify(userService, never()).getUserById(any());
			verify(ratingRepository, never()).save(any());
		}

		@Test
		@DisplayName("존재하지 않는 사용자로 평점 등록 시 예외 발생")
		void shouldThrowExceptionWhenUserNotFound() {
			// given
			Long nonExistentUserId = 999L;
			Long courseId = 1L;

			when(courseService.getCourseById(courseId)).thenReturn(testCourse);
			when(userService.getUserById(nonExistentUserId))
				.thenThrow(new CustomException(ErrorCode.USER_NOT_FOUND));

			// when & then
			assertThatThrownBy(
				() -> courseRatingService.createCourseRating(nonExistentUserId, courseId, validRatingRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.USER_NOT_FOUND.getMessage());

			verify(courseService).getCourseById(courseId);
			verify(userService).getUserById(nonExistentUserId);
			verify(ratingRepository, never()).save(any());
		}
	}

	@Nested
	@DisplayName("평점 삭제 테스트")
	class DeleteCourseRatingTest {

		@Test
		@DisplayName("정상 평점 삭제 성공")
		void shouldDeleteRating() {
			// given
			Long userId = 1L;
			Long courseId = 1L;

			when(ratingRepository.findByUserIdAndCourseId(userId, courseId))
				.thenReturn(Optional.of(testCourseRating));
			when(courseService.getCourseById(courseId)).thenReturn(testCourse);

			// when
			courseRatingService.deleteCourseRating(userId, courseId);

			// then
			verify(ratingRepository).findByUserIdAndCourseId(userId, courseId);
			verify(courseService).getCourseById(courseId);
			verify(statisticsService).removeRating(testCourse, 4.0);
			verify(ratingRepository).delete(testCourseRating);
		}

		@Test
		@DisplayName("존재하지 않는 평점 삭제 시 예외 발생")
		void shouldThrowExceptionWhenRatingNotFound() {
			// given
			Long userId = 1L;
			Long courseId = 1L;

			when(ratingRepository.findByUserIdAndCourseId(userId, courseId))
				.thenReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> courseRatingService.deleteCourseRating(userId, courseId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.RATING_NOT_FOUND.getMessage());

			verify(ratingRepository).findByUserIdAndCourseId(userId, courseId);
			verify(statisticsService, never()).removeRating(any(), any());
			verify(ratingRepository, never()).delete(any());
		}
	}

	@Nested
	@DisplayName("입력 데이터 유효성 검증 테스트")
	class InputValidationTest {

		@Test
		@DisplayName("null 사용자 ID로 평점 등록 시 예외 발생")
		void shouldThrowExceptionWhenUserIdIsNull() {
			// given
			Long courseId = 1L;

			// when & then
			assertThatThrownBy(() -> courseRatingService.createCourseRating(null, courseId, validRatingRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.MISSING_USER_ID.getMessage());

			verify(courseService, never()).getCourseById(any());
			verify(userService, never()).getUserById(any());
		}

		@Test
		@DisplayName("null 코스 ID로 평점 등록 시 예외 발생")
		void shouldThrowExceptionWhenCourseIdIsNull() {
			// given
			Long userId = 1L;

			// when & then
			assertThatThrownBy(() -> courseRatingService.createCourseRating(userId, null, validRatingRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.MISSING_COURSE_ID.getMessage());

			verify(courseService, never()).getCourseById(any());
			verify(userService, never()).getUserById(any());
		}

		@Test
		@DisplayName("잘못된 평점 값(0점) 등록 시 예외 발생")
		void shouldThrowExceptionWhenRatingTooLow() {
			// given
			Long userId = 1L;
			Long courseId = 1L;
			CourseRatingRequestDto invalidRequest = new CourseRatingRequestDto(0);  // 1점 미만

			// when & then
			assertThatThrownBy(() -> courseRatingService.createCourseRating(userId, courseId, invalidRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_RATING_VALUE.getMessage());

			verify(courseService, never()).getCourseById(any());
			verify(userService, never()).getUserById(any());
		}

		@Test
		@DisplayName("잘못된 평점 값(6점) 등록 시 예외 발생")
		void shouldThrowExceptionWhenRatingTooHigh() {
			// given
			Long userId = 1L;
			Long courseId = 1L;
			CourseRatingRequestDto invalidRequest = new CourseRatingRequestDto(6);  // 5점 초과

			// when & then
			assertThatThrownBy(() -> courseRatingService.createCourseRating(userId, courseId, invalidRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_RATING_VALUE.getMessage());

			verify(courseService, never()).getCourseById(any());
			verify(userService, never()).getUserById(any());
		}

		@Test
		@DisplayName("경계값 테스트 - 최소 평점(1점) 등록 성공")
		void shouldCreateRatingWithMinimumValue() {
			// given
			Long userId = 1L;
			Long courseId = 1L;
			CourseRatingRequestDto minRatingRequest = new CourseRatingRequestDto(1);

			when(courseService.getCourseById(courseId)).thenReturn(testCourse);
			when(userService.getUserById(userId)).thenReturn(testUser);
			when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
			when(ratingRepository.save(any(CourseRating.class))).thenReturn(testCourseRating);

			// when & then
			assertThatCode(() -> courseRatingService.createCourseRating(userId, courseId, minRatingRequest))
				.doesNotThrowAnyException();

			verify(statisticsService).addRating(testCourse, 1.0);
		}

		@Test
		@DisplayName("경계값 테스트 - 최대 평점(5점) 등록 성공")
		void shouldCreateRatingWithMaximumValue() {
			// given
			Long userId = 1L;
			Long courseId = 1L;
			CourseRatingRequestDto maxRatingRequest = new CourseRatingRequestDto(5);

			when(courseService.getCourseById(courseId)).thenReturn(testCourse);
			when(userService.getUserById(userId)).thenReturn(testUser);
			when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
			when(ratingRepository.save(any(CourseRating.class))).thenReturn(testCourseRating);

			// when & then
			assertThatCode(() -> courseRatingService.createCourseRating(userId, courseId, maxRatingRequest))
				.doesNotThrowAnyException();

			verify(statisticsService).addRating(testCourse, 5.0);
		}
	}

	@Nested
	@DisplayName("통계 업데이트 연동 테스트")
	class StatisticsIntegrationTest {

		@Test
		@DisplayName("평점 등록 시 통계 서비스 호출 확인")
		void shouldCallStatisticsServiceWhenCreateRating() {
			// given
			Long userId = 1L;
			Long courseId = 1L;

			when(courseService.getCourseById(courseId)).thenReturn(testCourse);
			when(userService.getUserById(userId)).thenReturn(testUser);
			when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
			when(ratingRepository.save(any(CourseRating.class))).thenReturn(testCourseRating);

			// when
			courseRatingService.createCourseRating(userId, courseId, validRatingRequest);

			// then
			verify(statisticsService).addRating(testCourse, 4.0);
		}

		@Test
		@DisplayName("평점 삭제 시 통계 서비스 호출 확인")
		void shouldCallStatisticsServiceWhenDeleteRating() {
			// given
			Long userId = 1L;
			Long courseId = 1L;

			when(ratingRepository.findByUserIdAndCourseId(userId, courseId))
				.thenReturn(Optional.of(testCourseRating));
			when(courseService.getCourseById(courseId)).thenReturn(testCourse);

			// when
			courseRatingService.deleteCourseRating(userId, courseId);

			// then
			verify(statisticsService).removeRating(testCourse, 4.0);
		}

		@Test
		@DisplayName("통계 서비스 오류 시 트랜잭션 롤백 확인")
		void shouldRollbackWhenStatisticsServiceFails() {
			// given
			Long userId = 1L;
			Long courseId = 1L;

			when(courseService.getCourseById(courseId)).thenReturn(testCourse);
			when(userService.getUserById(userId)).thenReturn(testUser);
			when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
			when(ratingRepository.save(any(CourseRating.class))).thenReturn(testCourseRating);
			doThrow(new RuntimeException("Statistics update failed"))
				.when(statisticsService).addRating(any(), any());

			// when & then
			assertThatThrownBy(() -> courseRatingService.createCourseRating(userId, courseId, validRatingRequest))
				.isInstanceOf(RuntimeException.class)
				.hasMessage("Statistics update failed");

			verify(ratingRepository).save(any(CourseRating.class));
			verify(statisticsService).addRating(testCourse, 4.0);
		}
	}
}