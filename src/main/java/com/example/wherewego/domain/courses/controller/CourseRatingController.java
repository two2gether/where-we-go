package com.example.wherewego.domain.courses.controller;

import com.example.wherewego.domain.courses.dto.request.CourseRatingDeleteRequestDto;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.request.CourseRatingRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseRatingResponseDto;
import com.example.wherewego.domain.courses.service.CourseRatingService;
import com.example.wherewego.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 코스 평점 관리 REST API 컨트롤러
 * 
 * 여행 코스에 대한 사용자 평점 등록 및 삭제 기능을 제공합니다.
 * 한 사용자당 한 코스에 대해 하나의 평점만 등록할 수 있으며,
 * 기존 평점이 있는 경우 덮어쓰기를 통해 업데이트됩니다.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseRatingController {

    private final CourseRatingService ratingService;

    /**
     * 코스 평점 등록 API
     * 
     * POST /api/ratings
     * 
     * 인증된 사용자가 특정 코스에 평점을 등록합니다.
     * 이미 해당 코스에 평점을 등록한 경우 기존 평점이 업데이트됩니다.
     * 평점은 1.0에서 5.0 사이의 값으로 제한되며, 코스의 전체 평균 평점에 반영됩니다.
     * 
     * @param request 평점 등록 요청 데이터
     * @param request 평점 등록 요청 데이터 (평점 값 포함)
     * @param userDetails 인증된 사용자 정보
     * @return 등록된 평점 정보
     */
    @PostMapping("/ratings")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourseRatingResponseDto> courseRatingCreate(
            @RequestBody @Valid CourseRatingRequestDto request,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        Long courseId = request.getCourseId();
        CourseRatingResponseDto response = ratingService.createCourseRating(userId, courseId, request);
        return ApiResponse.created( "평점이 등록되었습니다.", response);
    }


    /**
     * 코스 평점 삭제 API
     * 
     * DELETE /api/ratings
     * 
     * 인증된 사용자가 특정 코스에 등록한 평점을 삭제합니다.
     * 자신이 등록한 평점만 삭제할 수 있으며, 삭제 후 코스의 전체 평균 평점이 재계산됩니다.
     * 평점이 존재하지 않는 경우 오류를 반환합니다.
     * 
     * @param request 평점 삭제 요청 데이터
     * @param userDetail 인증된 사용자 정보 (권한 검증용)
     * @return 빈 응답과 성공 메시지
     */
    @DeleteMapping("/ratings")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> courseRatingDelete(
            @RequestBody @Valid CourseRatingDeleteRequestDto request,
            @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        Long userId = userDetail.getUser().getId();
        Long courseId = request.getCourseId();
        ratingService.deleteCourseRating(userId, courseId);
        return ApiResponse.noContent( "평점이 삭제되었습니다.");
    }
}
