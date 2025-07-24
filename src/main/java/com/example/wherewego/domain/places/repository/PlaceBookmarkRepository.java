package com.example.wherewego.domain.places.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.places.entity.PlaceBookmark;

/**
 * 장소 북마크 Repository
 */
@Repository
public interface PlaceBookmarkRepository extends JpaRepository<PlaceBookmark, Long> {

	/**
	 * 특정 사용자의 북마크 목록을 페이징으로 조회
	 */
	Page<PlaceBookmark> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

	/**
	 * 특정 사용자가 특정 장소를 북마크했는지 확인
	 */
	boolean existsByUserIdAndPlaceId(Long userId, String placeId);

	/**
	 * 특정 사용자의 특정 장소 북마크 조회
	 */
	Optional<PlaceBookmark> findByUserIdAndPlaceId(Long userId, String placeId);

	/**
	 * 특정 장소의 북마크 개수 조회
	 */
	long countByPlaceId(String placeId);

	/**
	 * 특정 사용자의 북마크한 장소 ID 목록 조회 (IN 쿼리용)
	 */
	@Query("SELECT pb.placeId FROM PlaceBookmark pb WHERE pb.user.id = :userId")
	List<String> findPlaceIdsByUserId(@Param("userId") Long userId);

	/**
	 * 여러 장소에 대한 특정 사용자의 북마크 상태 조회 (배치 처리용)
	 */
	@Query("SELECT pb.placeId FROM PlaceBookmark pb WHERE pb.user.id = :userId AND pb.placeId IN :placeIds")
	List<String> findBookmarkedPlaceIds(@Param("userId") Long userId, @Param("placeIds") List<String> placeIds);

	/**
	 * 특정 장소를 북마크한 사용자 수 조회
	 */
	@Query("SELECT COUNT(DISTINCT pb.user.id) FROM PlaceBookmark pb WHERE pb.placeId = :placeId")
	long countDistinctUsersByPlaceId(@Param("placeId") String placeId);
}