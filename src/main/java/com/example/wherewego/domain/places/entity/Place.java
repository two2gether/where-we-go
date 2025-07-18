package com.example.wherewego.domain.places.entity;


import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.courses.entity.Course;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 엔티티
 * - 외부 API(카카오, 네이버)에서 조회한 장소 정보의 식별자만 저장
 * - 실제 장소 상세 정보는 외부 API 실시간 호출을 통해 조회
 * - 코스 내 장소 순서 관리 및 북마크 기능 지원
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "places", 
    uniqueConstraints = {
        // 코스 내 방문 순서 중복 방지 (한 코스에서 같은 순서 번호 불가)
        @UniqueConstraint(name = "uk_course_place_order", columnNames = {"course_id", "visit_order"})
    },
    indexes = {
        // API 제공자별 장소 ID 빠른 조회를 위한 복합 인덱스
        @Index(name = "idx_api_provider_place", columnList = "api_provider, api_place_id")
    }
)
public class Place extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 장소가 속한 코스 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // 코스 내 방문 순서 (1부터 시작)
    @Column(nullable = false)
    private int visitOrder;

    // 외부 API 제공자 (kakao, naver)
    @Column(nullable = false, length = 20)
    private String apiProvider;

    // 외부 API에서 제공하는 장소 고유 ID
    @Column(nullable = false, length = 100)
    private String apiPlaceId;
}
