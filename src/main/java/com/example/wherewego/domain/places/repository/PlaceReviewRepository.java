package com.example.wherewego.domain.places.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.places.entity.PlaceReview;

/**
 * 장소 리뷰 Repository
 */
@Repository
public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {

	/**
	 * 특정 장소의 리뷰 목록을 페이징으로 조회 (N+1 문제 해결)
	 */
	@Query("SELECT r FROM PlaceReview r JOIN FETCH r.user WHERE r.placeId = :placeId ORDER BY r.createdAt DESC")
	Page<PlaceReview> findByPlaceIdOrderByCreatedAtDesc(@Param("placeId") String placeId, Pageable pageable);

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
	 * 특정 사용자가 작성한 모든 리뷰 조회 (N+1 문제 해결)
	 */
	@Query("SELECT r FROM PlaceReview r JOIN FETCH r.user WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
	Page<PlaceReview> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

	/**
	 * 특정 사용자가 특정 장소에 리뷰를 작성했는지 확인
	 */
	boolean existsByUserIdAndPlaceId(Long userId, String placeId);

	// ====================== 배치 쿼리 최적화 메서드 ======================

	/**
	 * 여러 장소의 리뷰 개수를 일괄 조회 (N+1 문제 해결)
	 * 
	 * @param placeIds 조회할 장소 ID 목록
	 * @return 장소 ID를 키로 하는 리뷰 개수 맵
	 */
	@Query("SELECT r.placeId, COUNT(r) FROM PlaceReview r WHERE r.placeId IN :placeIds GROUP BY r.placeId")
	List<Object[]> getReviewCountsByPlaceIds(@Param("placeIds") List<String> placeIds);

	/**
	 * 여러 장소의 평균 평점을 일괄 조회 (N+1 문제 해결)
	 * 
	 * @param placeIds 조회할 장소 ID 목록
	 * @return 장소 ID를 키로 하는 평균 평점 맵
	 */
	@Query("SELECT r.placeId, AVG(r.rating) FROM PlaceReview r WHERE r.placeId IN :placeIds GROUP BY r.placeId")
	List<Object[]> getAverageRatingsByPlaceIds(@Param("placeIds") List<String> placeIds);

	/**
	 * 특정 사용자가 여러 장소에 리뷰를 작성했는지 일괄 확인 (N+1 문제 해결)
	 * 
	 * @param userId 사용자 ID
	 * @param placeIds 확인할 장소 ID 목록
	 * @return 사용자가 리뷰를 작성한 장소 ID 목록
	 */
	@Query("SELECT DISTINCT r.placeId FROM PlaceReview r WHERE r.user.id = :userId AND r.placeId IN :placeIds")
	List<String> findPlaceIdsWithUserReviews(@Param("userId") Long userId, @Param("placeIds") List<String> placeIds);
}