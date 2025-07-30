package com.example.wherewego.domain.course.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CourseRatingRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseRatingResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.Rating;
import com.example.wherewego.domain.courses.repository.CourseRatingRepository;
import com.example.wherewego.domain.courses.service.CourseRatingService;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
public class CourseRatingServiceTest {

	@Mock
	UserService userService;
	@Mock
	CourseService courseService;
	@Mock
	CourseRatingRepository ratingRepository;

	@InjectMocks
	CourseRatingService ratingService;

	private final Long userId = 1L;
	private final Long courseId = 1L;
	private final int userRating = 4;

	@Test
	void 평점_생성_성공() {
		// given
		User user = createUser(userId);
		Course course = createCourse(courseId);
		Rating rating = new Rating(user, course, userRating);

		when(userService.getUserById(userId)).thenReturn(user);
		when(courseService.getCourseById(courseId)).thenReturn(course);
		when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
		when(ratingRepository.save(any(Rating.class))).thenReturn(rating);
		// when
		CourseRatingRequestDto request = new CourseRatingRequestDto(userRating);
		CourseRatingResponseDto response = ratingService.courseRatingCreate(userId, courseId, request);
		// then
		assertEquals(userId, response.getUserId());
		assertEquals(courseId, response.getCourseId());
	}

	@Test
	void 평점_생성_실패_평점_이미_존재() {
		// given
		when(ratingRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(true);

		// when
		CustomException exception = assertThrows(CustomException.class, () -> {
			CourseRatingRequestDto request = new CourseRatingRequestDto(userRating);
			ratingService.courseRatingCreate(userId, courseId, request);
		});
		// then
		assertEquals(ErrorCode.RATING_ALREADY_EXISTS, exception.getErrorCode());
	}

	@Test
	void 평점_삭제_성공() {
		// given
		User user = createUser(userId);
		Course course = createCourse(courseId);
		Rating rating = new Rating(user, course, userRating);
		double newAverage = 3.5;

		when(ratingRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.of(rating));
		when(courseService.getCourseById(courseId)).thenReturn(course);
		when(ratingRepository.findAverageByCourseId(courseId)).thenReturn(newAverage);
		// when
		ratingService.courseRatingDelete(userId, courseId);
		// then
		verify(ratingRepository).findByUserIdAndCourseId(userId, courseId);
		verify(ratingRepository).delete(rating);
		verify(courseService).getCourseById(courseId);
		verify(ratingRepository).findAverageByCourseId(courseId);
	}

	@Test
	void 평점_삭제_실패_평점이_없는_경우() {
		// given
		when(ratingRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.empty());

		// when, then
		CustomException exception = assertThrows(CustomException.class, () ->
			ratingService.courseRatingDelete(userId, courseId)
		);

		assertEquals(ErrorCode.RATING_NOT_FOUND, exception.getErrorCode());
	}

	// 자주 쓰는 코드 메서드로 분리
	private User createUser(Long id) {
		return User.builder()
			.id(id)
			.email("email")
			.password("password")
			.nickname("nickname")
			.profileImage("profileImage")
			.provider(Provider.LOCAL)
			.providerId("providerId")
			.build();
	}

	private Course createCourse(Long id) {
		return Course.builder()
			.id(id)
			.user(createUser(userId))
			.title("title")
			.description("description")
			.themes(List.of())
			.region("region")
			.likeCount(0)
			.averageRating(0.0)
			.viewCount(0)
			.bookmarkCount(0)
			.commentCount(0)
			.dailyScore(0)
			.isDeleted(false)
			.isPublic(true)
			.build();
	}
}