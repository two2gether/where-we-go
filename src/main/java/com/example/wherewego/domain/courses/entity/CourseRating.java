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
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 평점 정보를 저장하는 엔티티
 * 사용자가 등록한 코스 평점을 관리합니다.
 */
@Getter
@Entity
@NoArgsConstructor
@Table(name = "course_ratings")
public class CourseRating extends BaseEntity {

	/**
	 * 평점 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/**
	 * 평점을 매긴 사용자
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	/**
	 * 평점이 매겴진 코스
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id", nullable = false)
	private Course course;

	/**
	 * 평점 점수 (1-5점)
	 */
	@Column(nullable = false)
	private int rating;

	public CourseRating(User user, Course course, int rating) {
		this.user = user;
		this.course = course;
		this.rating = rating;
	}

	//수정용
	public void updateRating(int rating) {
		this.rating = rating;
	}
}