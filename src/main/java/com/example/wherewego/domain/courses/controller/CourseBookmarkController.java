package com.example.wherewego.domain.courses.controller;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.response.CourseBookmarkResponseDto;
import com.example.wherewego.domain.courses.service.CourseBookmarkService;
import com.example.wherewego.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseBookmarkController {

    private final CourseBookmarkService bookmarkService;

    // 코스 북마크 등록
    @PostMapping("/courses/{courseId}/bookmark")
    public ResponseEntity<ApiResponse<CourseBookmarkResponseDto>> courseBookmarkCreate(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        CourseBookmarkResponseDto response = bookmarkService.courseBookmarkCreate(userId, courseId);
        return new ResponseEntity<>(ApiResponse.ok("북마크가 등록되었습니다.", response), HttpStatus.CREATED);
    }


    // 코스 북마크 취소
    @DeleteMapping("/courses/{courseId}/bookmark")
    public ResponseEntity<ApiResponse<Void>> courseBookmarkDelete(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        bookmarkService.courseBookmarkDelete(userId, courseId);
        return ResponseEntity.ok(ApiResponse.ok("북마크가 취소되었습니다.", null));
    }
}
