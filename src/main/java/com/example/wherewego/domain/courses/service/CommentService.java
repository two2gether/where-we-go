package com.example.wherewego.domain.courses.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
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
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Set;

/**
 * 댓글 관리 서비스
 * 코스에 대한 댓글의 생성, 수정, 삭제, 조회 기능을 제공합니다.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CommentService {

	private final CommentRepository commentRepository;
	private final CourseRepository courseRepository;
	private final UserService userService;
	private final NotificationService notificationService;
	private final RedisTemplate<String, Object> redisTemplate;

	/**
	 * 코스에 새로운 댓글을 생성합니다.
	 * 비공개 코스인 경우 작성자만 댓글을 작성할 수 있습니다.
	 *
	 * @param courseId 댓글을 작성할 코스 ID
	 * @param userId 댓글 작성자 ID
	 * @param requestDto 댓글 내용을 담은 요청 DTO
	 * @return 생성된 댓글 정보
	 * @throws CustomException 사용자/코스를 찾을 수 없거나 비공개 코스에 접근 권한이 없는 경우
	 */
	@Transactional
	public CommentResponseDto createComment(Long courseId, Long userId, CommentRequestDto requestDto) {

		User user = userService.getUserById(userId);

		Course course = courseRepository.findByIdWithThemes(courseId)
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

		//알림 생성
		notificationService.triggerCommentNotification(user, course);

		// 캐시 삭제
		deleteCache(courseId, userId);

		return toDto(comment);
	}

	/**
	 * 댓글을 삭제합니다.
	 * 댓글 작성자만 삭제할 수 있습니다.
	 *
	 * @param commentId 삭제할 댓글 ID
	 * @param userId 삭제를 요청한 사용자 ID
	 * @throws CustomException 댓글을 찾을 수 없거나 삭제 권한이 없는 경우
	 */
	@Transactional
	public void deleteComment(Long commentId, Long userId) {

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

		// 캐시 삭제
		deleteCache(comment.getCourse().getId(), userId);
	}

	/**
	 * 댓글 내용을 수정합니다.
	 * 댓글 작성자만 수정할 수 있습니다.
	 *
	 * @param commentId 수정할 댓글 ID
	 * @param userId 수정을 요청한 사용자 ID
	 * @param requestDto 수정할 댓글 내용을 담은 요청 DTO
	 * @return 수정된 댓글 정보
	 * @throws CustomException 댓글을 찾을 수 없거나 수정 권한이 없는 경우
	 */
	@Transactional
	public CommentResponseDto updateComment(Long commentId, Long userId, CommentRequestDto requestDto) {

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

		// 캐시 삭제
		deleteCache(comment.getCourse().getId(), userId);

		return toDto(comment);
	}

	/**
	 * 특정 코스의 댓글 목록을 페이징하여 조회합니다.
	 * 최신 댓글 순으로 정렬됩니다.
	 *
	 * @param courseId 댓글을 조회할 코스 ID
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 페이징된 댓글 목록
	 */
	@Transactional(readOnly = true)
	@Cacheable(value = "course-comment-list", key = "@cacheKeyUtil.generateCourseCommentListKey(#courseId, #pageable.pageNumber, #pageable.pageSize)", unless = "#result == null")
	public PagedResponse<CommentResponseDto> getCommentsByCourse(Long courseId, Pageable pageable) {

		// 코스 존재 여부 확인
		courseRepository.findById(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		//JPA Repository를 통해 댓글 목록을 조회
		Page<Comment> commentPage = commentRepository.findAllByCourseIdOrderByCreatedAtDesc(courseId, pageable);

		//조회된 댓글 엔티티들을 DTO로 변환
		//현재 클래스(CommentService)의 인스턴스(this)인 toDto() 참조
		Page<CommentResponseDto> dtoPage = commentPage.map(this::toDto);
		log.debug("댓글 목록 조회 완료 - 조회된 댓글 수: {}", dtoPage.getTotalElements());

		return PagedResponse.from(dtoPage);
	}

	/**
	 * 특정 사용자가 작성한 댓글 목록을 페이징하여 조회합니다.
	 * 최신 댓글 순으로 정렬됩니다.
	 *
	 * @param userId 댓글 작성자 ID
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 페이징된 댓글 목록
	 */
	@Cacheable(value = "user-comment-list", key = "@cacheKeyUtil.generateUserCommentListKey(#userId, #pageable.pageNumber, #pageable.pageSize)", unless = "#result == null")
	public PagedResponse<CommentResponseDto> getCommentsByUser(Long userId, Pageable pageable) {
		Page<Comment> page = commentRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
		Page<CommentResponseDto> dtoPage = page.map(this::toDto);
		return PagedResponse.from(dtoPage);
	}

	/**
	 * Comment 엔티티를 CommentResponseDto로 변환합니다.
	 *
	 * @param comment 변환할 Comment 엔티티
	 * @return 변환된 CommentResponseDto
	 */
	private CommentResponseDto toDto(Comment comment) {
		return CommentResponseDto.of(comment);
	}

	/**
	 * 사용자가 비공개 코스의 소유자가 아닌지 확인합니다.
	 *
	 * @param userId 확인할 사용자 ID
	 * @param course 확인할 코스
	 * @return 비공개 코스이면서 소유자가 아닌 경우 true
	 */
	private boolean isNotCourseOwner(Long userId, Course course) {
		return !course.getIsPublic() && !course.getUser().getId().equals(userId);
	}

	/**
	 * Redis 캐시에서 특정 코스와 사용자의 댓글 목록 캐시를 삭제합니다.
	 *
	 * @param courseId 캐시를 삭제할 코스 ID
	 * @param userId   캐시를 삭제할 사용자 ID
	 */
	private void deleteCache(Long courseId, Long userId) {
		// 캐시 삭제
		String coursePattern = "course-comment-list::courseId:" + courseId + ":*";
		String userPattern = "user-comment-list::userId:" + userId + ":*";

		Set<String> couresKeysToDelete = redisTemplate.keys(coursePattern);
		Set<String> userKeysToDelete = redisTemplate.keys(userPattern);

		if (couresKeysToDelete != null && !couresKeysToDelete.isEmpty()) {
			redisTemplate.delete(couresKeysToDelete);
		}
		if (userKeysToDelete != null && !userKeysToDelete.isEmpty()) {
			redisTemplate.delete(userKeysToDelete);
		}
	}

}
