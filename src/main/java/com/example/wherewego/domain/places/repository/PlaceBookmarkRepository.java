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
	 * 여러 장소에 대한 특정 사용자의 북마크 상태 조회 (배치 처리용)
	 */
	@Query("SELECT pb.placeId FROM PlaceBookmark pb WHERE pb.user.id = :userId AND pb.placeId IN :placeIds")
	List<String> findBookmarkedPlaceIds(@Param("userId") Long userId, @Param("placeIds") List<String> placeIds);


	// ====================== 배치 쿼리 최적화 메서드 ======================

	/**
	 * 여러 장소의 북마크 개수를 일괄 조회 (N+1 문제 해결)
	 * 
	 * @param placeIds 조회할 장소 ID 목록
	 * @return 장소 ID를 키로 하는 북마크 개수 맵
	 */
	@Query("SELECT pb.placeId, COUNT(pb) FROM PlaceBookmark pb WHERE pb.placeId IN :placeIds GROUP BY pb.placeId")
	List<Object[]> getBookmarkCountsByPlaceIds(@Param("placeIds") List<String> placeIds);
}