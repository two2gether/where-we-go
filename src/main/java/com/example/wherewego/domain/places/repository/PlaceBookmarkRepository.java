package com.example.wherewego.domain.places.repository;

import com.example.wherewego.domain.places.entity.PlaceBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PlaceBookmark 엔티티 Repository
 * - 장소 북마크 관련 CRUD 및 사용자별 북마크 상태 확인 기능 제공
 */
@Repository
public interface PlaceBookmarkRepository extends JpaRepository<PlaceBookmark, Long> {

    /**
     * 특정 사용자의 특정 장소 북마크 조회
     * - 북마크 상태 확인 및 북마크 해제 시 사용
     * @param userId 사용자 ID
     * @param placeId 장소 ID
     * @return 북마크 엔티티 (Optional)
     */
    Optional<PlaceBookmark> findByUserIdAndPlaceId(Long userId, Long placeId);

    /**
     * 특정 사용자의 특정 장소 북마크 존재 여부 확인
     * - 북마크 상태 빠른 확인을 위해 사용
     * @param userId 사용자 ID
     * @param placeId 장소 ID
     * @return 북마크 존재 여부 (true/false)
     */
    boolean existsByUserIdAndPlaceId(Long userId, Long placeId);

    /**
     * 특정 사용자가 북마크한 장소 ID 목록 조회
     * - 장소 리스트에서 사용자의 북마크 상태를 일괄 확인하기 위해 사용
     * @param userId 사용자 ID
     * @param placeIds 확인할 장소 ID 목록
     * @return 북마크된 장소 ID 목록
     */
    @Query("SELECT pb.place.id FROM PlaceBookmark pb WHERE pb.user.id = :userId AND pb.place.id IN :placeIds")
    List<Long> findBookmarkedPlaceIdsByUserIdAndPlaceIds(@Param("userId") Long userId, @Param("placeIds") List<Long> placeIds);

    /**
     * 특정 사용자의 특정 장소 북마크 삭제
     * - 북마크 해제 기능에서 사용
     * @param userId 사용자 ID
     * @param placeId 장소 ID
     */
    void deleteByUserIdAndPlaceId(Long userId, Long placeId);

    /**
     * 특정 장소의 총 북마크 수 조회
     * - 장소 상세 정보에서 북마크 수 표시를 위해 사용
     * @param placeId 장소 ID
     * @return 북마크 수
     */
    @Query("SELECT COUNT(pb) FROM PlaceBookmark pb WHERE pb.place.id = :placeId")
    int countByPlaceId(@Param("placeId") Long placeId);
}