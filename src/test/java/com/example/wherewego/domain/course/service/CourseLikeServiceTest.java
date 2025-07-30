package com.example.wherewego.domain.course.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseLikeResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.Like;
import com.example.wherewego.domain.courses.repository.CourseLikeRepository;
import com.example.wherewego.domain.courses.service.CourseLikeService;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
public class CourseLikeServiceTest {

	@Mock
	UserService userService;
	@Mock
	CourseService courseService;
	@Mock
	CourseLikeRepository likeRepository;

	@InjectMocks
	CourseLikeService likeService;

	private final Long userId = 1L;
	private final Long courseId = 1L;

	@Test
	void 좋아요_생성_성공() {
		User user = User.builder().id(userId).build();
		Course course = Course.builder().id(courseId).build();
		Like like = new Like(user, course);

		when(userService.getUserById(userId)).thenReturn(user);
		when(courseService.getCourseById(courseId)).thenReturn(course);
		when(likeRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
		when(likeRepository.save(any(Like.class))).thenReturn(like);

		CourseLikeResponseDto response = likeService.courseLikeCeate(userId, courseId);

		assertEquals(userId, response.getUserId());
		assertEquals(courseId, response.getCourseId());
	}

	@Test
	void 좋아요_생성_실패_좋아요_이미_존재() {
		when(likeRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(true);

		CustomException exception = assertThrows(CustomException.class, () -> {
			likeService.courseLikeCeate(userId, courseId);
		});

		assertEquals(ErrorCode.LIKE_ALREADY_EXISTS, exception.getErrorCode());
	}

	@Test
	void 좋아요_삭제_성공() {
		User user = User.builder().id(userId).build();
		Course course = Course.builder().id(courseId).build();
		Like like = new Like(user, course);

		when(likeRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.of(like));
		when(courseService.getCourseById(courseId)).thenReturn(course);

		assertDoesNotThrow(() -> likeService.courseLikeDelete(userId, courseId));

		verify(likeRepository, times(1)).delete(like);
	}

	@Test
	void 좋아요_삭제_실패_없는_좋아요() {
		when(likeRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.empty());

		CustomException exception = assertThrows(CustomException.class, () -> {
			likeService.courseLikeDelete(userId, courseId);
		});

		assertEquals(ErrorCode.LIKE_NOT_FOUND, exception.getErrorCode());
	}

	@Test
	void 좋아요_생성시_코스_좋아요수_증가() {
		User user = User.builder().id(userId).build();
		Course course = spy(Course.builder().id(courseId).build());
		Like like = new Like(user, course);

		when(userService.getUserById(userId)).thenReturn(user);
		when(courseService.getCourseById(courseId)).thenReturn(course);
		when(likeRepository.existsByUserIdAndCourseId(userId, courseId)).thenReturn(false);
		when(likeRepository.save(any(Like.class))).thenReturn(like);

		likeService.courseLikeCeate(userId, courseId);

		verify(course, times(1)).incrementLikeCount();
	}

	@Test
	void 좋아요_삭제시_코스_좋아요수_감소() {
		User user = User.builder().id(userId).build();
		Course course = spy(Course.builder().id(courseId).build());
		Like like = new Like(user, course);

		when(likeRepository.findByUserIdAndCourseId(userId, courseId)).thenReturn(Optional.of(like));
		when(courseService.getCourseById(courseId)).thenReturn(course);

		likeService.courseLikeDelete(userId, courseId);

		verify(course, times(1)).decrementLikeCount();
	}

}
