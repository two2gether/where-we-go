package com.example.wherewego.domain.course.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

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
import org.springframework.data.redis.core.RedisTemplate;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CommentCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.response.CommentResponseDto;
import com.example.wherewego.domain.courses.entity.Comment;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.repository.CommentRepository;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.courses.service.CommentService;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.courses.service.NotificationService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("CommentService 테스트")
class CommentServiceTest {

	@InjectMocks
	private CommentService commentService;

	@Mock
	private CommentRepository commentRepository;

	@Mock
	private UserService userService;

	@Mock
	private CourseRepository courseRepository;

	@Mock
	private NotificationService notificationService;
	
	@Mock
	private CourseService courseService;
	
	@Mock
	private RedisTemplate<String, Object> redisTemplate;

	private User user;
	private Course course;

	@BeforeEach
	void setUp() {
		user = User.builder()
			.id(1L)
			.nickname("tester")
			.build();

		course = Course.builder()
			.id(10L)
			.user(user)
			.isPublic(true)
			.build();
	}

	@Nested
	@DisplayName("댓글 생성")
	class CreateComment {

		@Test
		@DisplayName("댓글을 정상적으로 생성한다")
		void shouldCreateComment() {
			// given
			CommentCreateRequestDto requestDto = new CommentCreateRequestDto(10L, "댓글 내용");

			given(userService.getUserById(1L)).willReturn(user);
			given(courseService.getCourseById(10L)).willReturn(course);
			given(commentRepository.save(any(Comment.class)))
				.willAnswer(invocation -> invocation.getArgument(0));

			// when
			CommentResponseDto result = commentService.createComment(1L, requestDto);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getContent()).isEqualTo("댓글 내용");
			assertThat(result.getNickname()).isEqualTo("tester");
		}

		@Test
		@DisplayName("비공개 코스에 작성자가 아닌 사람이 댓글을 작성하려고 하면 예외가 발생한다")
		void shouldThrowExceptionWhenNotOwnerTriesToCommentOnPrivateCourse() {
			// given
			Course privateCourse = Course.builder()
				.id(20L)
				.user(User.builder().id(999L).build()) // 작성자는 ID 999인 다른 사람
				.isPublic(false)  //비공개코스 생성
				.build();

			CommentCreateRequestDto requestDto = new CommentCreateRequestDto(20L, "비공개 댓글");

			given(userService.getUserById(1L)).willReturn(user); //현재 로그인된 사용자는 id=1
			given(courseService.getCourseById(20L)).willReturn(privateCourse);

			// when & then
			assertThatThrownBy(() -> commentService.createComment(1L, requestDto))
				.isInstanceOf(CustomException.class)
				.hasMessageContaining(ErrorCode.CANNOT_COMMENT_ON_PRIVATE_COURSE.getMessage());
		}
	}

	@Nested
	@DisplayName("댓글 삭제")
	class DeleteComment {

		@Test
		@DisplayName("댓글을 정상적으로 삭제한다")
		void shouldDeleteComment() {
			// given
			Comment comment = Comment.builder()
				.id(100L)
				.content("삭제할 댓글")
				.user(user)
				.course(course)
				.build();

			given(commentRepository.findById(100L)).willReturn(Optional.of(comment));

			// when
			commentService.deleteComment(100L, 1L);

			// then
			verify(commentRepository).delete(comment);
		}
	}

	@Nested
	@DisplayName("댓글 수정")
	class UpdateComment {

		@Test
		@DisplayName("댓글을 정상적으로 수정한다")
		void shouldUpdateComment() {
			// given
			Comment comment = Comment.builder()
				.id(101L)
				.content("기존 댓글")
				.user(user)
				.course(course)
				.build();

			CommentRequestDto requestDto = new CommentRequestDto("수정된 댓글");

			given(commentRepository.findById(101L)).willReturn(Optional.of(comment));

			// when
			CommentResponseDto result = commentService.updateComment(101L, 1L, requestDto);

			// then
			assertThat(result.getContent()).isEqualTo("수정된 댓글");
		}
	}

	@Nested
	@DisplayName("댓글 목록 조회")
	class GetComments {

		@Test
		@DisplayName("코스별 댓글 목록을 정상적으로 조회한다")
		void shouldGetCommentsByCourse() {
			// given
			Pageable pageable = PageRequest.of(0, 10);
			List<Comment> comments = List.of(
				Comment.builder().id(1L).content("댓글1").user(user).course(course).build(),
				Comment.builder().id(2L).content("댓글2").user(user).course(course).build()
			);
			Page<Comment> commentPage = new PageImpl<>(comments, pageable, comments.size());

			given(courseRepository.findById(10L)).willReturn(Optional.of(course));

			given(commentRepository.findAllByCourseIdOrderByCreatedAtDesc(10L, pageable)).willReturn(commentPage);

			// when
			PagedResponse<CommentResponseDto> result = commentService.getCommentsByCourse(10L, pageable);

			// then
			assertThat(result.getContent()).hasSize(2);
			assertThat(result.getContent().get(0).getContent()).isEqualTo("댓글1");
		}
	}
}