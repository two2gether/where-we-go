package com.example.wherewego.domain.courses.controller;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.response.CourseLikeResponseDto;
import com.example.wherewego.domain.courses.service.CourseLikeService;
import com.example.wherewego.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseLikeController {

    private final CourseLikeService likeService;

    // 코스 좋아요 등록
    @PostMapping("/courses/{courseId}/like")
    public ResponseEntity<ApiResponse<CourseLikeResponseDto>> courseLikeCeate(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        CourseLikeResponseDto response = likeService.courseLikeCeate(userId, courseId);
        return new ResponseEntity<>(ApiResponse.ok( "좋아요가 등록되었습니다.", response), HttpStatus.CREATED);
    }

    // 코스 좋아요 삭제
    @DeleteMapping("/courses/{courseId}/like")
    public ResponseEntity<ApiResponse<Void>> courseLikeDelete(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetail userDetails
    ) {
        Long userId = userDetails.getUser().getId();
        likeService.courseLikeDelete(userId, courseId);
        return ResponseEntity.ok(ApiResponse.ok("좋아요가 삭제되었습니다.", null));
    }
}
