package com.example.wherewego.domain.places.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 리뷰 엔티티
 * - 사용자가 장소에 대해 작성하는 리뷰 정보
 * - 평점(1-5점)과 리뷰 내용으로 구성
 * - 사용자당 장소별 하나의 리뷰만 작성 가능
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "place_reviews", uniqueConstraints = {
    // 사용자당 같은 장소 중복 리뷰 방지
    @UniqueConstraint(name = "uk_user_place_review", columnNames = {"user_id", "place_id"})
})
public class PlaceReview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 리뷰 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 카카오 API 장소 ID (문자열)
    @Column(name = "place_id", nullable = false, length = 50)
    private String placeId;

    // 평점 (1-5점)
    @Column(nullable = false)
    private Integer rating;

    // 리뷰 내용 (선택사항)
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * 리뷰 수정을 위한 메서드
     */
    public void updateReview(Integer rating, String content) {
        this.rating = rating;
        this.content = content;
    }

    /**
     * 평점 유효성 검증
     */
    @PrePersist
    @PreUpdate
    private void validateRating() {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("평점은 1-5 사이의 값이어야 합니다.");
        }
    }
}