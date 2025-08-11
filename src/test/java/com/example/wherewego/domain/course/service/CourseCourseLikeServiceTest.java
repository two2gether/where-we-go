package com.example.wherewego.domain.course.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseLikeResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseLike;
import com.example.wherewego.domain.courses.repository.CourseLikeRepository;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.courses.repository.PlacesOrderRepository;
import com.example.wherewego.domain.courses.service.CourseLikeService;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.courses.service.NotificationService;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
@DisplayName("CourseLikeService 테스트")
public class CourseCourseLikeServiceTest {

	@Mock
	UserService userService;
	@Mock
	CourseService courseService;
	@Mock
	CourseLikeRepository likeRepository;
	@Mock
	CourseRepository courseRepository;
	@Mock
	PlacesOrderRepository placesOrderRepository;
	@Mock
	PlaceService placeService;
	@Mock
	NotificationService notificationService;
	@Mock
	RedisTemplate<String, Object> redisTemplate;

	@InjectMocks
	CourseLikeService likeService;

	private final Long userId = 1L;
	private final Long courseId = 1L;

	@Nested
	@DisplayName("좋아요 생성")
	class CreateCourseLike {

		@Test
		@DisplayName("좋아요를 정상적으로 생성한다")
		void shouldCreateLike() {
			// given
			User user = User.builder().id(userId).build();
			Course course = Course.builder().id(courseId).build();
			CourseLike courseLike = new CourseLike(user, course);

			when(userService.getUserById(userId)).thenReturn(user);
			when(courseService.getCourseById(courseId)).thenReturn(course);
			when(likeRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
			when(likeRepository.save(any(CourseLike.class))).thenReturn(courseLike);

			// when
			CourseLikeResponseDto response = likeService.createCourseLike(userId, courseId);

			// then
			assertEquals(userId, response.getUserId());
			assertEquals(courseId, response.getCourseId());
		}

		@Test
		@DisplayName("이미 좋아요한 코스에 좋아요하려고 하면 예외가 발생한다")
		void shouldThrowExceptionWhenLikeAlreadyExists() {
			// given
			when(likeRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(true);

			// when & then
			CustomException exception = assertThrows(CustomException.class, () -> {
				likeService.createCourseLike(userId, courseId);
			});

			assertEquals(ErrorCode.LIKE_ALREADY_EXISTS, exception.getErrorCode());
		}

		@Test
		@DisplayName("좋아요 생성 시 코스의 좋아요 수가 증가한다")
		void shouldIncrementLikeCountWhenCreateLike() {
			// given
			User user = User.builder().id(userId).build();
			Course course = spy(Course.builder().id(courseId).build());
			CourseLike courseLike = new CourseLike(user, course);

			when(userService.getUserById(userId)).thenReturn(user);
			when(courseService.getCourseById(courseId)).thenReturn(course);
			when(likeRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
			when(likeRepository.save(any(CourseLike.class))).thenReturn(courseLike);

			// when
			likeService.createCourseLike(userId, courseId);

			// then
			verify(course, times(1)).incrementLikeCount();
		}
	}

	@Nested
	@DisplayName("좋아요 삭제")
	class DeleteCourseLike {

		@Test
		@DisplayName("좋아요를 정상적으로 삭제한다")
		void shouldDeleteLike() {
			// given
			User user = User.builder().id(userId).build();
			Course course = Course.builder().id(courseId).build();
			CourseLike courseLike = new CourseLike(user, course);

			when(likeRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.of(courseLike));
			when(courseService.getCourseById(courseId)).thenReturn(course);

			// when & then
			assertDoesNotThrow(() -> likeService.deleteCourseLike(userId, courseId));
			verify(likeRepository, times(1)).delete(courseLike);
		}

		@Test
		@DisplayName("존재하지 않는 좋아요를 삭제하려고 하면 예외가 발생한다")
		void shouldThrowExceptionWhenLikeNotFound() {
			// given
			when(likeRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.empty());

			// when & then
			CustomException exception = assertThrows(CustomException.class, () -> {
				likeService.deleteCourseLike(userId, courseId);
			});

			assertEquals(ErrorCode.LIKE_NOT_FOUND, exception.getErrorCode());
		}

		@Test
		@DisplayName("좋아요 삭제 시 코스의 좋아요 수가 감소한다")
		void shouldDecrementLikeCountWhenDeleteLike() {
			// given
			User user = User.builder().id(userId).build();
			Course course = spy(Course.builder().id(courseId).build());
			CourseLike courseLike = new CourseLike(user, course);

			when(likeRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.of(courseLike));
			when(courseService.getCourseById(courseId)).thenReturn(course);

			// when
			likeService.deleteCourseLike(userId, courseId);

			// then
			verify(course, times(1)).decrementLikeCount();
		}
	}

}
