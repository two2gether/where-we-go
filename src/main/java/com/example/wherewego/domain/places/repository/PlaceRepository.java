package com.example.wherewego.domain.places.repository;

import com.example.wherewego.domain.places.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Place 엔티티 Repository
 * - 장소 검색 및 북마크 관련 기본 CRUD 및 커스텀 쿼리 제공
 */
@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    /**
     * API 제공자와 API 장소 ID로 장소 조회
     * - 외부 API에서 조회한 장소가 이미 DB에 저장되어 있는지 확인
     * @param apiProvider API 제공자 (kakao, naver)
     * @param apiPlaceId 외부 API 장소 ID
     * @return 해당 장소 엔티티 (Optional)
     */
    Optional<Place> findByApiProviderAndApiPlaceId(String apiProvider, String apiPlaceId);

    /**
     * 특정 장소의 북마크 수 조회
     * - 장소 상세 정보에서 북마크 수 표시를 위해 사용
     * @param placeId 장소 ID
     * @return 북마크 수
     */
    @Query("SELECT COUNT(pb) FROM PlaceBookmark pb WHERE pb.place.id = :placeId")
    int countBookmarksByPlaceId(@Param("placeId") Long placeId);

    /**
     * API 제공자와 API 장소 ID로 장소 존재 여부 확인
     * - 장소 등록 전 중복 확인을 위해 사용
     * @param apiProvider API 제공자 (kakao, naver)
     * @param apiPlaceId 외부 API 장소 ID
     * @return 존재 여부 (true/false)
     */
    boolean existsByApiProviderAndApiPlaceId(String apiProvider, String apiPlaceId);
}