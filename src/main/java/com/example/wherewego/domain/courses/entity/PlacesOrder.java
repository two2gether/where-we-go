package com.example.wherewego.domain.courses.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 코스-장소 연결 엔티티
 * 코스 내 장소들의 방문 순서를 관리
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "places_order")
public class PlacesOrder {

    /**
     * JPA 요구사항을 위한 기본 키
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 연결된 코스 ID
     */
    @Column(name = "course_id", nullable = false)
    private Long courseId;

    /**
     * 카카오 API 장소 ID
     */
    @Column(name = "place_id", nullable = false, length = 20)
    private String placeId;

    /**
     * 코스 내 방문 순서 (1부터 시작)
     */
    @Column(name = "visit_order", nullable = false)
    private Integer visitOrder;

    /**
     * 생성 일시
     */
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

}