package com.example.wherewego.domain.courses.entity;

import com.example.wherewego.domain.common.entity.BaseEntity;
import com.example.wherewego.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 좋아요 정보를 저장하는 엔티티
 * 사용자와 코스 간의 좋아요 관계를 관리합니다.
 */
@Getter
@Entity
@NoArgsConstructor
@Table(
	name = "course_likes",
	uniqueConstraints = @UniqueConstraint(
		name = "uq_course_like_user_course",
		columnNames = {"user_id", "course_id"}
	)
)
public class CourseLike extends BaseEntity {

	/**
	 * 좋아요 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/**
	 * 좋아요를 누른 사용자
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	/**
	 * 좋아요가 눌린 코스
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id", nullable = false)
	private Course course;

	/**
	 * 좋아요 활성 여부
	 */
	@Column(name = "active", nullable = false)
	private Boolean active = true;

	public CourseLike(User user, Course course) {
		this.user = user;
		this.course = course;
		this.active = true;
	}
}