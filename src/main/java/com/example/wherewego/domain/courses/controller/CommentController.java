package com.example.wherewego.domain.courses.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.request.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.response.CommentResponseDto;
import com.example.wherewego.domain.courses.service.CommentService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class CommentController {

	private final CommentService commentService;

	// 코스 댓글 생성
	@PostMapping("/api/courses/{courseId}/comments")
	public ResponseEntity<ApiResponse<CommentResponseDto>> createComment(
		@RequestBody @Valid CommentRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long userId = userDetails.getUser().getId();

		CommentResponseDto responseDto = commentService.createComment(requestDto.getCourseId(), userId, requestDto);
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.ok("댓글이 생성되었습니다.", responseDto));
	}

	// 코스 댓글 삭제
	@DeleteMapping("/api/courses/{courseId}/comments/{commentId}")
	public ResponseEntity<ApiResponse<Void>> deleteComment(
		@PathVariable Long commentId,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long userId = userDetails.getUser().getId();

		commentService.deleteComment(commentId, userId);

		return ResponseEntity.status(HttpStatus.OK)
			.body(ApiResponse.ok("댓글이 삭제되었습니다.", null));
	}

	// 코스 댓글 수정
	@PatchMapping("/api/courses/{courseId}/comments/{commentId}")
	public ResponseEntity<ApiResponse<CommentResponseDto>> updateComment(
		@PathVariable Long commentId,
		@RequestBody @Valid CommentRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long userId = userDetails.getUser().getId();

		CommentResponseDto responseDto = commentService.updateComment(commentId, userId, requestDto);

		return ResponseEntity.status(HttpStatus.OK)
			.body(ApiResponse.ok("댓글이 수정되었습니다.", responseDto));
	}

	//코스 댓글 목록 조회
	@GetMapping("/api/courses/{courseId}/comments")
	public ResponseEntity<ApiResponse<PagedResponse<CommentResponseDto>>> getComments(
		@PathVariable Long courseId,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

		PagedResponse<CommentResponseDto> response = commentService.getCommentsByCourse(courseId, pageable);

		return ResponseEntity.status(HttpStatus.OK)
			.body(ApiResponse.ok("댓글 목록이 조회되었습니다.", response));
	}
}
