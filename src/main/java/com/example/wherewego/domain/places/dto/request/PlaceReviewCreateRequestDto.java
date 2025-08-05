package com.example.wherewego.domain.places.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 리뷰 작성 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceReviewCreateRequestDto {

    /**
     * 평점 (1-5점, 필수)
     */
    @NotNull(message = "평점은 필수입니다")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다")
    private Integer rating;

    /**
     * 리뷰 내용 (선택사항, 최대 1000자)
     */
    @Size(max = 1000, message = "리뷰 내용은 1000자 이하여야 합니다")
    private String content;
}