package com.example.wherewego.domain.courses.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.response.CourseBookmarkResponseDto;
import com.example.wherewego.domain.courses.service.CourseBookmarkService;
import com.example.wherewego.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 코스 북마크 관리 REST API 컨트롤러
 * 
 * 여행 코스에 대한 사용자 북마크 등록 및 취소 기능을 제공합니다.
 * 한 사용자당 한 코스에 대해 하나의 북마크만 등록할 수 있으며,
 * 북마크된 코스는 마이페이지에서 별도 관리됩니다. 북마크 수는 코스의 인기도 지표에 반영됩니다.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseBookmarkController {

    private final CourseBookmarkService bookmarkService;

    /**
     * 코스 북마크 등록 API
     * 
     * POST /api/courses/{courseId}/bookmark
     * 
     * 인증된 사용자가 특정 코스를 북마크에 추가합니다.
     * 이미 북마크된 코스인 경우 중복 등록으로 처리되어 기존 북마크가 유지됩니다.
     * 북마크된 코스는 마이페이지에서 별도로 확인할 수 있으며, 인기도 지표에 영향을 줍니다.
     * 
     * @param courseId 북마크를 등록할 코스 ID
     * @param userDetails 인증된 사용자 정보
     * @return 등록된 북마크 정보
     */
    @PostMapping("/courses/{courseId}/bookmark")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourseBookmarkResponseDto> courseBookmarkCreate(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        CourseBookmarkResponseDto response = bookmarkService.createCourseBookmark(userId, courseId);
        return ApiResponse.created( "북마크가 등록되었습니다.", response);
    }


    /**
     * 코스 북마크 취소 API
     * 
     * DELETE /api/courses/{courseId}/bookmark
     * 
     * 인증된 사용자가 특정 코스에 등록한 북마크를 취소합니다.
     * 자신이 등록한 북마크만 취소할 수 있으며, 취소 후 마이페이지에서도 제거됩니다.
     * 북마크가 존재하지 않는 경우 오류를 반환합니다.
     * 
     * @param courseId 북마크를 취소할 코스 ID
     * @param userDetails 인증된 사용자 정보 (권한 검증용)
     * @return 빈 응답과 성공 메시지
     */
    @DeleteMapping("/courses/{courseId}/bookmark")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> courseBookmarkDelete(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        bookmarkService.deleteCourseBookmark(userId, courseId);
        return ApiResponse.noContent( "북마크가 취소되었습니다.");
    }
}
