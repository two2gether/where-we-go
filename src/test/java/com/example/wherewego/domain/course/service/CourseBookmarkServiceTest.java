package com.example.wherewego.domain.course.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseBookmarkResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseBookmark;
import com.example.wherewego.domain.courses.repository.CourseBookmarkRepository;
import com.example.wherewego.domain.courses.service.CourseBookmarkService;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
@DisplayName("CourseBookmarkService 테스트")
class CourseBookmarkServiceTest {

	@Mock
	UserService userService;
	@Mock
	CourseService courseService;
	@Mock
	private CourseBookmarkRepository bookmarkRepository;

	@InjectMocks
	private CourseBookmarkService bookmarkService;

	private final Long userId = 1L;
	private final Long courseId = 1L;

	@Nested
	@DisplayName("북마크 추가")
	class AddBookmark {

		@Test
		@DisplayName("북마크를 정상적으로 생성한다")
		void shouldCreateCourseBookmark() {
			// given
			User user = createUser(userId);
			Course course = createCourse(courseId);

			int beforeCount = course.getBookmarkCount();
			when(courseService.getCourseById(100L)).thenReturn(course);
			when(userService.getUserById(1L)).thenReturn(user);
			when(bookmarkRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(false);

			CourseBookmark bookmark = new CourseBookmark(user, course);
			ReflectionTestUtils.setField(bookmark, "id", 10L);
			when(bookmarkRepository.save(any(CourseBookmark.class))).thenReturn(bookmark);

			// when
			CourseBookmarkResponseDto result = bookmarkService.createCourseBookmark(1L, 100L);

			// then
			assertEquals(10L, result.getId());
			assertEquals(1L, result.getUserId());
			assertEquals(1L, result.getCourseId());
			assertEquals(beforeCount + 1, course.getBookmarkCount());
		}

		@Test
		@DisplayName("이미 북마크된 코스를 추가하려고 하면 예외가 발생한다")
		void shouldThrowExceptionWhenBookmarkAlreadyExists() {
			// given
			User user = createUser(userId);
			Course course = createCourse(courseId);

			when(courseService.getCourseById(100L)).thenReturn(course);
			when(userService.getUserById(1L)).thenReturn(user);
			when(bookmarkRepository.existsByUserIdAndCourseId(1L, 100L)).thenReturn(true);

			// when & then
			CustomException exception = assertThrows(CustomException.class,
				() -> bookmarkService.createCourseBookmark(1L, 100L));
			assertEquals(ErrorCode.BOOKMARK_ALREADY_EXISTS, exception.getErrorCode());
		}
	}

	@Nested
	@DisplayName("북마크 삭제")
	class RemoveBookmark {

		@Test
		@DisplayName("북마크를 정상적으로 삭제한다")
		void shouldDeleteCourseBookmark() {
			// given
			User user = createUser(userId);
			Course course = createCourse(courseId);

			CourseBookmark bookmark = new CourseBookmark(user, course);

			when(courseService.getCourseById(100L)).thenReturn(course);
			when(bookmarkRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.of(bookmark));

			// when
			bookmarkService.deleteCourseBookmark(1L, 100L);

			// then
			verify(bookmarkRepository).delete(bookmark);
		}

		@Test
		@DisplayName("존재하지 않는 북마크를 삭제하려고 하면 예외가 발생한다")
		void shouldThrowExceptionWhenBookmarkNotFound() {
			// given
			User user = createUser(userId);
			Course course = createCourse(courseId);

			when(courseService.getCourseById(100L)).thenReturn(course);
			when(bookmarkRepository.findByUserIdAndCourseId(1L, 100L)).thenReturn(Optional.empty());

			// when & then
			CustomException exception = assertThrows(CustomException.class,
				() -> bookmarkService.deleteCourseBookmark(1L, 100L));
			assertEquals(ErrorCode.BOOKMARK_NOT_FOUND, exception.getErrorCode());
		}
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
