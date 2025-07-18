package com.example.wherewego.domain.places.entity;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 장소 북마크 엔티티
 * - 사용자가 관심 있는 장소를 북마크하는 기능
 * - 사용자와 장소 간 다대다 관계를 중간 테이블로 관리
 * - 중복 북마크 방지를 위한 unique constraint 설정
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "place_bookmarks", uniqueConstraints = {
    // 사용자당 같은 장소 중복 북마크 방지
    @UniqueConstraint(name = "uk_user_place_bookmark", columnNames = {"user_id", "place_id"})
})
public class PlaceBookmark extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 북마크한 사용자 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 북마크된 장소 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    // 북마크 생성을 위한 생성자
    public PlaceBookmark(User user, Place place) {
        this.user = user;
        this.place = place;
    }
}