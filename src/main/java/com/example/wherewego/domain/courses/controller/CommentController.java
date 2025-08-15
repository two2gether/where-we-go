package com.example.wherewego.domain.courses.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.request.CommentCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.response.CommentResponseDto;
import com.example.wherewego.domain.courses.service.CommentService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 코스 댓글 관리 REST API 컨트롤러
 *
 * 여행 코스에 대한 댓글의 생성, 조회, 수정, 삭제 기능을 제공합니다.
 * 댓글은 인증된 사용자만 작성할 수 있으며, 작성자만 수정 및 삭제가 가능합니다.
 * 페이지네이션을 지원하여 대량의 댓글도 효율적으로 처리할 수 있습니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping
public class CommentController {

	private final CommentService commentService;

	/**
	 * 코스 댓글 생성 API
	 *
	 * POST /api/comments
	 *
	 * 인증된 사용자가 특정 코스에 댓글을 작성합니다.
	 * 댓글 내용은 유효성 검증을 거쳐 저장되며, 작성 시간과 작성자 정보가 함께 기록됩니다.
	 *
	 * @param requestDto 댓글 작성 요청 데이터 (courseId, 내용 포함)
	 * @param userDetails 인증된 사용자 정보
	 * @return 생성된 댓글 정보
	 */
	@PostMapping("/api/comments")
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<CommentResponseDto> createComment(
		@RequestBody @Valid CommentCreateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long userId = userDetails.getUser().getId();

		CommentResponseDto responseDto = commentService.createComment(userId, requestDto);

		return ApiResponse.created("댓글이 생성되었습니다.", responseDto);
	}

	/**
	 * 코스 댓글 삭제 API
	 *
	 * DELETE /api/comments/{commentId}
	 *
	 * 인증된 사용자가 자신이 작성한 댓글을 삭제합니다.
	 * 작성자 본인만 삭제할 수 있으며, 권한 검증을 통해 보안을 보장합니다.
	 * 삭제된 댓글은 더 이상 조회할 수 없습니다.
	 *
	 * @param commentId 삭제할 댓글 ID
	 * @param userDetails 인증된 사용자 정보 (권한 검증용)
	 * @return 빈 응답과 성공 메시지
	 */
	@DeleteMapping("/api/comments/{commentId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ApiResponse<Void> deleteComment(
		@PathVariable Long commentId,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long userId = userDetails.getUser().getId();

		commentService.deleteComment(commentId, userId);

		return ApiResponse.noContent("댓글이 삭제되었습니다.");
	}

	/**
	 * 코스 댓글 수정 API
	 *
	 * PATCH /api/comments/{commentId}
	 *
	 * 인증된 사용자가 자신이 작성한 댓글의 내용을 수정합니다.
	 * 작성자 본인만 수정할 수 있으며, 수정 시간이 기록됩니다.
	 * 수정된 내용은 유효성 검증을 거쳐 저장됩니다.
	 *
	 * @param commentId 수정할 댓글 ID
	 * @param requestDto 댓글 수정 요청 데이터 (새로운 내용)
	 * @param userDetails 인증된 사용자 정보 (권한 검증용)
	 * @return 수정된 댓글 정보
	 */
	@PatchMapping("/api/comments/{commentId}")
	public ApiResponse<CommentResponseDto> updateComment(
		@PathVariable Long commentId,
		@RequestBody @Valid CommentRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long userId = userDetails.getUser().getId();

		CommentResponseDto responseDto = commentService.updateComment(commentId, userId, requestDto);

		return ApiResponse.ok("댓글이 수정되었습니다.", responseDto);
	}

	/**
	 * 코스 댓글 목록 조회 API
	 *
	 * GET /api/comments
	 *
	 * 특정 코스에 달린 모든 댓글을 페이지단위로 조회합니다.
	 * 댓글은 작성일 내림차순으로 정렬되며, 작성자 정보와 작성/수정 시간이 포함됩니다.
	 * 인증 없이도 조회 가능하지만, 공개 코스의 댓글만 조회됩니다.
	 * 인증된 사용자의 경우 isMine 필드가 포함되어 본인이 작성한 댓글을 구분할 수 있습니다.
	 *
	 * @param courseId 댓글을 조회할 코스 ID
	 * @param pageable 페이지네이션 정보 (기본: 10개씩, 작성일 내림차순)
	 * @param userDetails 현재 인증된 사용자 정보 (선택적)
	 * @return 페이지네이션된 댓글 목록 (isMine 필드 포함)
	 */
	@GetMapping("/api/comments")
	public ApiResponse<PagedResponse<CommentResponseDto>> getComments(
		@RequestParam Long courseId,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long currentUserId = userDetails != null ? userDetails.getUser().getId() : null;
		PagedResponse<CommentResponseDto> response = commentService.getCommentsByCourse(courseId, pageable, currentUserId);

		return ApiResponse.ok("댓글 목록이 조회되었습니다.", response);
	}
}
