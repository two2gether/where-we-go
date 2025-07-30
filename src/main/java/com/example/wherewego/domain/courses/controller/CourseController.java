package com.example.wherewego.domain.courses.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.request.CourseUpdateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDeleteResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseUpdateResponseDto;
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
	@PostMapping("/list")
	public ResponseEntity<ApiResponse<PagedResponse<CourseListResponseDto>>> courseList(
		@RequestParam String region,
		@RequestParam(required = false) List<CourseTheme> themes,
		@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		CourseListFilterDto filterDto = new CourseListFilterDto(region, themes);

		PagedResponse<CourseListResponseDto> response = courseService.getCourseList(filterDto, pageable);

		return ResponseEntity.ok(ApiResponse.ok("코스 목록 조회를 성공했습니다.", response));
	}

	/**
	 * 코스 상세 조회 api
	 */
	@GetMapping("/{courseId}")
	public ResponseEntity<ApiResponse<CourseDetailResponseDto>> courseDetail(
		@PathVariable Long courseId,
		@RequestParam(required = false) Double userLatitude,
		@RequestParam(required = false) Double userLongitude
	) {
		CourseDetailResponseDto response = courseService.getCourseDetail(courseId, userLatitude, userLongitude);

		return ResponseEntity.ok(ApiResponse.ok("코스 조회를 성공했습니다.", response));
	}

	/**
	 * 코스 수정 api
	 */
	@PatchMapping("/{courseId}")
	public ResponseEntity<ApiResponse<CourseUpdateResponseDto>> updateCourse(
		@PathVariable Long courseId,
		@RequestBody @Valid CourseUpdateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		CourseUpdateResponseDto response = courseService.updateCourseInfo(courseId, requestDto, userId);

		return ResponseEntity.ok(ApiResponse.ok("코스가 성공적으로 수정되었습니다.", response));
	}

	/**
	 * 코스 삭제 api
	 */
	@DeleteMapping("/{courseId}")
	public ResponseEntity<ApiResponse<CourseDeleteResponseDto>> deleteCourse(
		@PathVariable Long courseId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();

		CourseDeleteResponseDto response = courseService.deleteCourseById(courseId, userId);

		return ResponseEntity.ok(ApiResponse.ok("코스가 삭제되었습니다.", response));
	}

	/**
	 * 인기 코스 목록 조회 api
	 */
	@GetMapping("/popular")
	public ResponseEntity<ApiResponse<PagedResponse<CourseListResponseDto>>> popularCourseList(
		@RequestParam String region,
		@RequestParam(required = false) List<CourseTheme> themes,
		@PageableDefault(page = 0, size = 10) Pageable pageable
	) {
		CourseListFilterDto filterDto = new CourseListFilterDto(region, themes);

		PagedResponse<CourseListResponseDto> response = courseService.getPopularCourseList(filterDto, pageable);

		return ResponseEntity.ok(ApiResponse.ok("인기 코스 목록 조회 성공", response));
	}
}
