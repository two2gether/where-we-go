package com.example.wherewego.domain.like.controller;

import com.example.wherewego.domain.like.dto.LikeResponseDto;
import com.example.wherewego.domain.like.service.LikeService;
import com.example.wherewego.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    // 코스 좋아요 등록
    @PostMapping("/courses/{courseId}/like")
    public ResponseEntity<ApiResponse<LikeResponseDto>> create(
            @PathVariable Long courseId
    ) {
        // TODO 인가 처리
        Long userId = 1L;
        LikeResponseDto dto = likeService.create(userId, courseId);
        return new ResponseEntity<>(ApiResponse.ok( "좋아요가 등록되었습니다.", dto), HttpStatus.CREATED);
    }

    // 코스 좋아요 삭제
    @DeleteMapping("/courses/{courseId}/like")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long courseId
    ) {
        // TODO 인가 처리
        Long userId = 1L;
        likeService.delete(userId, courseId);
        return ResponseEntity.ok(ApiResponse.ok("좋아요가 삭제되었습니다.", null));
    }
}
