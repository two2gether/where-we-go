package com.example.wherewego.domain.places.entity;

import com.example.wherewego.domain.common.entity.BaseEntity;
import com.example.wherewego.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
@Table(name = "place_bookmarks",
	uniqueConstraints = {
		// 사용자당 같은 장소 중복 북마크 방지
		@UniqueConstraint(name = "uk_user_place_bookmark", columnNames = {"user_id", "place_id"})
	},
	indexes = {
		// 조회 성능을 위한 인덱스
		@Index(name = "idx_place_id", columnList = "place_id"),
		@Index(name = "idx_user_id", columnList = "user_id")
	}
)
public class PlaceBookmark extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// 북마크한 사용자 (다대일 관계)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	// 카카오 API 장소 ID (문자열)
	@Column(name = "place_id", nullable = false, length = 30)
	private String placeId;

	// 북마크 생성을 위한 생성자
	public PlaceBookmark(User user, String placeId) {
		this.user = user;
		this.placeId = placeId;
	}
}