package com.example.wherewego.domain.courses.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.response.CommentResponseDto;
import com.example.wherewego.domain.courses.entity.Comment;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.repository.CommentRepository;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommentService {

	private final CommentRepository commentRepository;
	private final UserRepository userRepository;
	private final CourseRepository courseRepository;

	// 코스 댓글 생성
	@Transactional
	public CommentResponseDto createComment(Long courseId, Long userId, CommentRequestDto requestDto) {
		log.debug("댓글 생성 요청 - courseId: {}, userId: {}, content: {}", courseId, userId, requestDto.getContent());

		User user = userRepository.findById(userId)
			.orElseThrow(() -> {
				log.warn("댓글 생성 실패 - 사용자 없음: {}", userId);
				return new CustomException(ErrorCode.USER_NOT_FOUND);
			});

		Course course = courseRepository.findById(courseId)
			.orElseThrow(() -> {
				log.warn("댓글 생성 실패 - 코스 없음: {}", courseId);
				return new CustomException(ErrorCode.COURSE_NOT_FOUND);
			});

		if (isNotCourseOwner(userId, course)) {
			log.warn("댓글 생성 실패 - 비공개 코스에 접근 시도: courseId {}, 작성자 {}, 요청자 {}",
				courseId, course.getUser().getId(), userId);
			throw new CustomException(ErrorCode.CANNOT_COMMENT_ON_PRIVATE_COURSE);
		}

		Comment comment = Comment.builder()
			.content(requestDto.getContent())
			.user(user)
			.course(course)
			.build();

		commentRepository.save(comment);
		log.debug("댓글 생성 성공 - commentId: {}", comment.getId());

		return toDto(comment);
	}

	// 코스 댓글 삭제
	@Transactional
	public void deleteComment(Long commentId, Long userId) {
		log.debug("댓글 삭제 요청 - commentId: {}, userId: {}", commentId, userId);

		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> {
				log.warn("댓글 삭제 실패 - 댓글 없음: {}", commentId);
				return new CustomException(ErrorCode.COMMENT_NOT_FOUND);
			});

		// 인가 검사 (작성자 본인인지 확인)
		if (!userId.equals(comment.getUser().getId())) {
			log.warn("댓글 삭제 실패 - 인가되지 않은 접근: userId {}, commentOwnerId {}", userId, comment.getUser().getId());
			throw new CustomException(ErrorCode.UNAUTHORIZED_COMMENT_ACCESS);
		}

		commentRepository.delete(comment);
		log.debug("댓글 삭제 성공 - commentId: {}", commentId);
	}

	// 코스 댓글 수정
	@Transactional
	public CommentResponseDto updateComment(Long commentId, Long userId, CommentRequestDto requestDto) {
		log.debug("댓글 수정 요청 - commentId: {}, userId: {}, newContent: {}", commentId, userId, requestDto.getContent());

		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> {
				log.warn("댓글 수정 실패 - 댓글 없음: {}", commentId);
				return new CustomException(ErrorCode.COMMENT_NOT_FOUND);
			});

		// 인가 검사 (작성자 본인인지 확인)
		if (!comment.getUser().getId().equals(userId)) {
			log.warn("댓글 수정 실패 - 인가되지 않은 접근: userId {}, commentOwnerId {}", userId, comment.getUser().getId());
			throw new CustomException(ErrorCode.UNAUTHORIZED_COMMENT_ACCESS);
		}

		comment.updateContent(requestDto.getContent());
		log.debug("댓글 수정 성공 - commentId: {}", commentId);

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
		log.debug("댓글 목록 조회 완료 - 조회된 댓글 수: {}", dtoPage.getTotalElements());

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

	private boolean isNotCourseOwner(Long userId, Course course) {
		return !course.getIsPublic() && !course.getUser().getId().equals(userId);
	}

}
