package com.example.wherewego.domain.courses.controller;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.request.CourseRatingRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseRatingResponseDto;
import com.example.wherewego.domain.courses.service.CourseRatingService;
import com.example.wherewego.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseRatingController {

    private final CourseRatingService ratingService;

    // 평점 등록
    @PostMapping("/courses/{courseId}/rating")
    public ResponseEntity<ApiResponse<CourseRatingResponseDto>> courseRatingCreate(
            @PathVariable Long courseId,
            @RequestBody @Valid CourseRatingRequestDto request,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        CourseRatingResponseDto response = ratingService.courseRatingCreate(userId, courseId, request);
        return new ResponseEntity<>(ApiResponse.ok("평점이 등록되었습니다.", response), HttpStatus.CREATED);
    }


    // 평점 삭제
    @DeleteMapping("/courses/{courseId}/rating")
    public ResponseEntity<ApiResponse<Void>> courseRatingDelete(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        Long userId = userDetail.getUser().getId();
        ratingService.courseRatingDelete(userId, courseId);
        return ResponseEntity.ok(ApiResponse.ok("평점이 삭제되었습니다.", null));
    }
}
