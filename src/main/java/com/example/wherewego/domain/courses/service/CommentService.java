package com.example.wherewego.domain.courses.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.CommentResponseDto;
import com.example.wherewego.domain.courses.entity.Comment;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.repository.CommentRepository;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

	private final CommentRepository commentRepository;
	private final UserRepository userRepository;
	private final CourseRepository courseRepository;

	// 코스 댓글 생성
	public CommentResponseDto createComment(Long courseId, Long userId, CommentRequestDto requestDto) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		Course course = courseRepository.findById(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		Comment comment = Comment.builder()
			.content(requestDto.getContent())
			.user(user)
			.course(course)
			.build();

		commentRepository.save(comment);

		return toDto(comment);
	}

	// 코스 댓글 삭제
	public void deleteComment(Long commentId, Long userId) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));

		// 인가 검사 (작성자 본인인지 확인)
		if (!comment.getUser().getId().equals(userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_COMMENT_ACCESS);
		}

		commentRepository.delete(comment);
	}

	// 코스 댓글 수정
	public CommentResponseDto updateComment(Long commentId, Long userId, CommentRequestDto requestDto) {

		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));

		// 인가 검사 (작성자 본인인지 확인)
		if (!comment.getUser().getId().equals(userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_COMMENT_ACCESS);
		}

		comment.updateContent(requestDto.getContent());

		return toDto(comment);
	}

	// 코스 댓글 목록 조회
	@Transactional(readOnly = true)  //DB 변경이 없는 읽기 작업
	public PagedResponse<CommentResponseDto> getCommentsByCourse(Long courseId, Pageable pageable) {

		//JPA Repository를 통해 댓글 목록을 조회
		Page<Comment> commentPage = commentRepository.findAllByCourseIdOrderByCreatedAtDesc(courseId, pageable);

		//조회된 댓글 엔티티들을 DTO로 변환
		//현재 클래스(CommentService)의 인스턴스(this)인 toDto() 참조
		Page<CommentResponseDto> dtoPage = commentPage.map(this::toDto);

		return PagedResponse.from(dtoPage);
	}

	// 사용자 조회 메서드
	public PagedResponse<CommentResponseDto> getCommentsByUser(Long userId, Pageable pageable) {
		Page<Comment> page = commentRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
		Page<CommentResponseDto> dtoPage = page.map(this::toDto);
		return PagedResponse.from(dtoPage);
	}

	private CommentResponseDto toDto(Comment comment) {
		return CommentResponseDto.of(comment);
	}

}
