package com.example.wherewego.domain.courses.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.response.CourseLikeResponseDto;
import com.example.wherewego.domain.courses.service.CourseLikeService;
import com.example.wherewego.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 코스 좋아요 관리 REST API 컨트롤러
 *
 * 여행 코스에 대한 사용자 좋아요 등록 및 취소 기능을 제공합니다.
 * 한 사용자당 한 코스에 대해 하나의 좋아요만 등록할 수 있으며,
 * 중복 등록 시 기존 좋아요가 유지됩니다. 좋아요 수는 코스의 인기도 지표에 반영됩니다.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseLikeController {

	private final CourseLikeService likeService;

    /**
     * 코스 좋아요 등록 API
     * 
     * POST /api/likes
     *
     * 인증된 사용자가 특정 코스에 좋아요를 등록합니다.
     * 이미 좋아요를 등록한 경우 중복 등록으로 처리되어 기존 좋아요가 유지됩니다.
     * 좋아요 등록 시 코스의 전체 좋아요 수가 증가하며 인기도에 반영됩니다.
     *
     * @param request 좋아요 생성 요청 데이터
     * @param userDetails 인증된 사용자 정보
     * @return 등록된 좋아요 정보
     */
    @PostMapping("/likes")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourseLikeResponseDto> courseLikeCreate(
            @RequestBody @Valid CourseLikeRequestDto request,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        Long courseId = request.getCourseId();
        CourseLikeResponseDto response = likeService.createCourseLike(userId, courseId);
        return ApiResponse.created( "좋아요가 등록되었습니다.", response);
    }

    /**
     * 코스 좋아요 취소 API
     * 
     * DELETE /api/likes
     *
     * 인증된 사용자가 특정 코스에 등록한 좋아요를 취소합니다.
     * 자신이 등록한 좋아요만 취소할 수 있으며, 취소 후 코스의 전체 좋아요 수가 감소합니다.
     * 좋아요가 존재하지 않는 경우 오류를 반환합니다.
     *
     * @param request 좋아요 취소 요청 데이터
     * @param userDetails 인증된 사용자 정보 (권한 검증용)
     * @return 빈 응답과 성공 메시지
     */
    @DeleteMapping("/likes")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> courseLikeDelete(
            @RequestBody @Valid CourseLikeRequestDto request,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        Long courseId = request.getCourseId();
        likeService.deleteCourseLike(userId, courseId);
        return ApiResponse.noContent( "좋아요가 삭제되었습니다.");
    }
}
