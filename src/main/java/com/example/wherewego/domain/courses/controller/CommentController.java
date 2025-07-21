package com.example.wherewego.domain.courses.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.CommentResponseDto;
import com.example.wherewego.domain.courses.service.CommentService;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/courses/{courseId}/comments")
public class CommentController {

	private final CommentService commentService;

	@PostMapping
	public ResponseEntity<ApiResponse<CommentResponseDto>> createComment(
		@PathVariable Long courseId,
		@RequestBody @Valid CommentRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetails) {

		Long userId = userDetails.getUser().getId();

		CommentResponseDto responseDto = commentService.createComment(courseId, userId, requestDto);
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(ApiResponse.ok("댓글이 생성되었습니다.", responseDto));
	}

}
