package com.example.wherewego.domain.places.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.places.dto.request.PlaceReviewCreateRequestDto;
import com.example.wherewego.domain.places.dto.request.PlaceReviewUpdateRequestDto;
import com.example.wherewego.domain.places.dto.response.PlaceReviewCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceReviewResponseDto;
import com.example.wherewego.domain.places.service.PlaceReviewService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 장소 리뷰 API 컨트롤러
 * 
 * 장소 리뷰 CRUD 기능을 제공하는 REST API 엔드포인트를 구현합니다.
 * 사용자 인증, 권한 검증, 유효성 검사 등을 처리합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceReviewController {

    private final PlaceReviewService placeReviewService;

    /**
     * 장소 리뷰 작성
     * 
     * POST /api/places/{placeId}/reviews
     * 
     * @param placeId 장소 ID
     * @param requestDto 리뷰 작성 요청 데이터
     * @param userDetail 인증된 사용자 정보
     * @return 작성된 리뷰 정보
     */
    @PostMapping("/{placeId}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PlaceReviewCreateResponseDto> createReview(
            @PathVariable String placeId,
            @Valid @RequestBody PlaceReviewCreateRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetail userDetail) {
        
        log.info("리뷰 작성 API 호출 - placeId: {}, userId: {}", placeId, userDetail.getUser().getId());
        
        PlaceReviewCreateResponseDto response = placeReviewService.createReview(
            placeId, requestDto, userDetail.getUser().getId());
        
        return ApiResponse.created("리뷰가 성공적으로 작성되었습니다.", response);
    }

    /**
     * 장소 리뷰 목록 조회
     * 
     * GET /api/places/{placeId}/reviews?page=0&size=10
     * 
     * @param placeId 장소 ID
     * @param page 페이지 번호 (기본값: 0)
     * @param size 페이지 크기 (기본값: 10)
     * @param userDetail 인증된 사용자 정보 (선택사항)
     * @return 페이징된 리뷰 목록
     */
    @GetMapping("/{placeId}/reviews")
    public ApiResponse<PagedResponse<PlaceReviewResponseDto>> getPlaceReviews(
            @PathVariable String placeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetail userDetail) {
        
        log.info("장소 리뷰 목록 조회 API 호출 - placeId: {}, page: {}, size: {}", placeId, page, size);
        
        Long currentUserId = userDetail != null ? userDetail.getUser().getId() : null;
        PagedResponse<PlaceReviewResponseDto> response = placeReviewService.getPlaceReviews(
            placeId, page, size, currentUserId);
        
        return ApiResponse.ok("리뷰 목록을 성공적으로 조회했습니다.", response);
    }

    /**
     * 내 리뷰 수정
     * 
     * PUT /api/places/{placeId}/reviews
     * 
     * @param placeId 장소 ID
     * @param requestDto 리뷰 수정 요청 데이터
     * @param userDetail 인증된 사용자 정보
     * @return 수정된 리뷰 정보
     */
    @PutMapping("/{placeId}/reviews")
    public ApiResponse<PlaceReviewResponseDto> updateMyReview(
            @PathVariable String placeId,
            @Valid @RequestBody PlaceReviewUpdateRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetail userDetail) {
        
        log.info("리뷰 수정 API 호출 - placeId: {}, userId: {}", placeId, userDetail.getUser().getId());
        
        PlaceReviewResponseDto response = placeReviewService.updateMyReview(
            placeId, requestDto, userDetail.getUser().getId());
        
        return ApiResponse.ok("리뷰가 성공적으로 수정되었습니다.", response);
    }

    /**
     * 내 리뷰 삭제
     * 
     * DELETE /api/places/{placeId}/reviews
     * 
     * @param placeId 장소 ID
     * @param userDetail 인증된 사용자 정보
     * @return 삭제 성공 메시지
     */
    @DeleteMapping("/{placeId}/reviews")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteMyReview(
            @PathVariable String placeId,
            @AuthenticationPrincipal CustomUserDetail userDetail) {
        
        log.info("리뷰 삭제 API 호출 - placeId: {}, userId: {}", placeId, userDetail.getUser().getId());
        
        placeReviewService.deleteMyReview(placeId, userDetail.getUser().getId());
        
        return ApiResponse.noContent("리뷰가 성공적으로 삭제되었습니다.");
    }


}