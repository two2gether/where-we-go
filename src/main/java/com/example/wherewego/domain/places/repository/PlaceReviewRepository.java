package com.example.wherewego.domain.places.repository;

import com.example.wherewego.domain.places.entity.PlaceReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 장소 리뷰 Repository
 */
@Repository
public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {

    /**
     * 특정 장소의 리뷰 목록을 페이징으로 조회
     */
    Page<PlaceReview> findByPlaceIdOrderByCreatedAtDesc(String placeId, Pageable pageable);

    /**
     * 특정 사용자가 특정 장소에 작성한 리뷰 조회
     */
    Optional<PlaceReview> findByUserIdAndPlaceId(Long userId, String placeId);

    /**
     * 특정 장소의 평균 평점 계산
     */
    @Query("SELECT AVG(r.rating) FROM PlaceReview r WHERE r.placeId = :placeId")
    Double getAverageRatingByPlaceId(@Param("placeId") String placeId);

    /**
     * 특정 장소의 리뷰 개수 조회
     */
    long countByPlaceId(String placeId);

    /**
     * 특정 장소의 평점별 리뷰 개수 조회 (통계용)
     */
    @Query("SELECT r.rating, COUNT(r) FROM PlaceReview r WHERE r.placeId = :placeId GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByPlaceId(@Param("placeId") String placeId);

    /**
     * 특정 사용자가 작성한 모든 리뷰 조회
     */
    Page<PlaceReview> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 특정 사용자가 특정 장소에 리뷰를 작성했는지 확인
     */
    boolean existsByUserIdAndPlaceId(Long userId, String placeId);
}