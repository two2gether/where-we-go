package com.example.wherewego.domain.course.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.response.CommentResponseDto;
import com.example.wherewego.domain.courses.entity.Comment;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.repository.CommentRepository;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.courses.service.CommentService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

class CommentServiceTest {

	@InjectMocks
	private CommentService commentService;

	@Mock
	private CommentRepository commentRepository;

	@Mock
	private UserRepository userRepository;

	@Mock
	private CourseRepository courseRepository;

	private User user;
	private Course course;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);

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

	@Test
	@DisplayName("댓글 생성 성공")
	void createComment_success() {
		// given
		CommentRequestDto requestDto = new CommentRequestDto("댓글 내용");

		given(userRepository.findById(1L)).willReturn(Optional.of(user));
		given(courseRepository.findById(10L)).willReturn(Optional.of(course));
		given(commentRepository.save(any(Comment.class)))
			.willAnswer(invocation -> invocation.getArgument(0));

		// when
		CommentResponseDto result = commentService.createComment(10L, 1L, requestDto);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getContent()).isEqualTo("댓글 내용");
		assertThat(result.getNickname()).isEqualTo("tester");
	}

	@Test
	@DisplayName("댓글 생성 실패 - 비공개 코스에 작성자가 아닌 사람이 작성하려고 하는 경우")
	void createComment_privateCourseNotOwner() {
		// given
		Course privateCourse = Course.builder()
			.id(20L)
			.user(User.builder().id(999L).build()) // 작성자는 ID 999인 다른 사람
			.isPublic(false)  //비공개코스 생성
			.build();

		CommentRequestDto requestDto = new CommentRequestDto("비공개 댓글");

		given(userRepository.findById(1L)).willReturn(Optional.of(user)); //현재 로그인된 사용자는 id=1
		given(courseRepository.findById(20L)).willReturn(Optional.of(privateCourse));

		// when & then
		assertThatThrownBy(() -> commentService.createComment(20L, 1L, requestDto))
			.isInstanceOf(CustomException.class)
			.hasMessageContaining(ErrorCode.CANNOT_COMMENT_ON_PRIVATE_COURSE.getMessage());
	}

	@Test
	@DisplayName("댓글 삭제 성공")
	void deleteComment_success() {
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

	@Test
	@DisplayName("댓글 수정 성공")
	void updateComment_success() {
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

	@Test
	@DisplayName("코스별 댓글 목록 조회 성공")
	void getCommentsByCourse_success() {
		// given
		Pageable pageable = PageRequest.of(0, 10);
		List<Comment> comments = List.of(
			Comment.builder().id(1L).content("댓글1").user(user).course(course).build(),
			Comment.builder().id(2L).content("댓글2").user(user).course(course).build()
		);
		Page<Comment> commentPage = new PageImpl<>(comments, pageable, comments.size());

		given(commentRepository.findAllByCourseIdOrderByCreatedAtDesc(10L, pageable)).willReturn(commentPage);

		// when
		PagedResponse<CommentResponseDto> result = commentService.getCommentsByCourse(10L, pageable);

		// then
		assertThat(result.content()).hasSize(2);
		assertThat(result.content().get(0).getContent()).isEqualTo("댓글1");
	}
}