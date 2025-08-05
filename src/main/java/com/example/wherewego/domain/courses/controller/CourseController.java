package com.example.wherewego.domain.courses.controller;

import java.util.List;

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
import com.example.wherewego.domain.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.request.CourseUpdateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseUpdateResponseDto;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 여행 코스 관리 REST API 컨트롤러
 *
 * 여행 코스의 생성, 조회, 수정, 삭제 기능과 지역 및 테마 기반 검색 기능을 제공합니다.
 * 인기 코스 조회, 페이지네이션, 사용자 및 권한 관리 기능을 포함합니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/courses")
public class CourseController {

	private final CourseService courseService;

	/**
	 * 새로운 여행 코스를 생성합니다.
	 * 인증된 사용자만 사용 가능합니다.
	 *
	 * @param requestDto 코스 생성 요청 데이터
	 * @param userDetail 인증된 사용자 정보
	 * @return 생성된 코스 정보를 포함한 API 응답
	 */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<CourseCreateResponseDto> registerCourse(
		@RequestBody @Valid CourseCreateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		CourseCreateResponseDto response = courseService.createCourse(requestDto, userId);

		return ApiResponse.created("코스가 성공적으로 생성되었습니다.", response);
	}

	/**
	 * 지역과 테마 조건에 따라 공개된 코스 목록을 페이징하여 조회합니다.
	 * 성능 최적화된 지역 검색과 N+1 쿼리 해결이 적용되어 있습니다.
	 *
	 * @param region 검색할 지역 (필수)
	 * @param themes 필터링할 테마 목록 (선택사항)
	 * @param pageable 페이징 정보 (기본: 10개씩, 생성일 내림차순)
	 * @return 페이징된 코스 목록과 메타데이터
	 */
	@GetMapping
	public ApiResponse<PagedResponse<CourseListResponseDto>> getCourseList(
		@RequestParam String region,
		@RequestParam(required = false) List<CourseTheme> themes,
		@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		CourseListFilterDto filterDto = new CourseListFilterDto(region, themes);

		PagedResponse<CourseListResponseDto> response = courseService.getCourseList(filterDto, pageable);

		return ApiResponse.ok("코스 목록 조회를 성공했습니다.", response);
	}

	/**
	 * 코스의 상세 정보를 조회하고 조회수를 증가시킵니다.
	 * 사용자 위치 정보가 있으면 루트 계산을 제공합니다.
	 *
	 * @param courseId 조회할 코스 ID
	 * @param userLatitude 사용자 현재 위도 (루트 계산용, 선택사항)
	 * @param userLongitude 사용자 현재 경도 (루트 계산용, 선택사항)
	 * @return 코스 상세 정보 (장소 목록, 루트 정보 포함)
	 */
	@GetMapping("/{courseId}")
	public ApiResponse<CourseDetailResponseDto> getCourseDetail(
		@PathVariable Long courseId,
		@RequestParam(required = false) Double userLatitude,
		@RequestParam(required = false) Double userLongitude
	) {
		CourseDetailResponseDto response = courseService.getCourseDetail(courseId, userLatitude, userLongitude);

		return ApiResponse.ok("코스 조회를 성공했습니다.", response);
	}

	/**
	 * 기존 코스의 정보를 수정합니다.
	 * 코스 작성자만 수정할 수 있습니다.
	 *
	 * @param courseId 수정할 코스 ID
	 * @param requestDto 수정할 코스 정보
	 * @param userDetail 인증된 사용자 정보
	 * @return 수정된 코스 정보를 포함한 API 응답
	 */
	@PatchMapping("/{courseId}")
	public ApiResponse<CourseUpdateResponseDto> updateCourse(
		@PathVariable Long courseId,
		@RequestBody @Valid CourseUpdateRequestDto requestDto,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		CourseUpdateResponseDto response = courseService.updateCourseInfo(courseId, requestDto, userId);

		return ApiResponse.ok("코스가 성공적으로 수정되었습니다.", response);
	}

	/**
	 * 코스 삭제 API
	 *
	 * DELETE /api/courses/{courseId}
	 *
	 * 기존 코스를 삭제합니다.
	 * 코스 작성자만 삭제할 수 있으며, 권한 검증을 통해 보안을 보장합니다.
	 * 삭제된 코스는 더 이상 조회할 수 없으며, 관련 데이터도 함께 정리됩니다.
	 *
	 * @param courseId 삭제할 코스의 고유 ID
	 * @param userDetail 인증된 사용자 정보 (권한 검증용)
	 * @return 빈 응답과 성공 메시지
	 */
	@DeleteMapping("/{courseId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ApiResponse<Void> deleteCourse(
		@PathVariable Long courseId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getUser().getId();
		courseService.deleteCourseById(courseId, userId);

		return ApiResponse.noContent("코스가 삭제되었습니다.");
	}

	/**
	 * 인기 코스 목록 조회 API
	 *
	 * GET /api/courses/popular
	 *
	 * 지역과 테마 조건에 따라 북마크 수를 기반으로 인기 코스 목록을 조회합니다.
	 * 이달의 북마크 수가 많은 순서대로 정렬하여 최신 인기 트렌드를 반영합니다.
	 * 사용자들이 실제로 저장하고 싶어하는 코스들을 우선적으로 보여줍니다.
	 *
	 * @param region 검색할 지역 (필수)
	 * @param themes 필터링할 테마 목록 (선택사항)
	 * @param pageable 페이지네이션 정보 (기본: 10개씩)
	 * @return 북마크 수 순으로 정렬된 인기 코스 목록
	 */
	@GetMapping("/popular")
	public ApiResponse<PagedResponse<CourseListResponseDto>> getPopularCourseList(
		@RequestParam String region,
		@RequestParam(required = false) List<CourseTheme> themes,
		@PageableDefault(page = 0, size = 10) Pageable pageable
	) {
		CourseListFilterDto filterDto = new CourseListFilterDto(region, themes);

		PagedResponse<CourseListResponseDto> response = courseService.getPopularCourseList(filterDto, pageable);

		return ApiResponse.ok("인기 코스 목록 조회 성공", response);
	}
}
