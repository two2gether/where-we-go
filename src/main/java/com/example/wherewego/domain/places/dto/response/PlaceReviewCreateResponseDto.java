package com.example.wherewego.domain.places.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 리뷰 작성 성공 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceReviewCreateResponseDto {

    /**
     * 생성된 리뷰 ID
     */
    private Long reviewId;

    /**
     * 평점
     */
    private Integer rating;

    /**
     * 리뷰 내용
     */
    private String content;

    /**
     * 작성자 정보
     */
    private UserInfo user;

    /**
     * 작성일시
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime createdAt;

    /**
     * 리뷰 작성자 정보
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        /**
         * 작성자 ID
         */
        private Long userId;

        /**
         * 작성자 닉네임
         */
        private String nickname;

        /**
         * 작성자 프로필 이미지
         */
        private String profileImage;
    }
}