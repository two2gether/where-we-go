package com.example.wherewego.domain.courses.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/courses")
public class CourseController {

	private final CourseService courseService;

	/**
	 * 코스 생성 api
	 */
	@PostMapping
	public ResponseEntity<ApiResponse<CourseCreateResponseDto>> registerCourse(
		@RequestBody @Valid CourseCreateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		CourseCreateResponseDto response = courseService.createCourse(requestDto, userId);

		return ResponseEntity.ok(ApiResponse.ok("코스가 성공적으로 생성되었습니다.", response));
	}

	/**
	 * 코스 목록 조회 api
	 */
	@GetMapping
	public ResponseEntity<ApiResponse<PagedResponse<CourseListResponseDto>>> courseList(
		@Validated @RequestBody CourseListFilterDto filterDto,
		@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		PagedResponse<CourseListResponseDto> response = courseService.getCourseList(filterDto, pageable);

		return ResponseEntity.ok(ApiResponse.ok("코스 목록 조회를 성공했습니다.", response));
	}

	/**
	 * 코스 상세 조회 api
	 */
	@GetMapping("/{courseId}")
	public ResponseEntity<ApiResponse<CourseDetailResponseDto>> courseDetail(@PathVariable Long courseId) {
		CourseDetailResponseDto response = courseService.getCourseDetail(courseId);

		return ResponseEntity.ok(ApiResponse.ok("코스 조회를 성공했습니다.", response));
	}

	/**
	 * 코스 수정 api
	 */
	@PatchMapping("/{courseId}")
	public void updateCourse() {

		return;
	}
}
