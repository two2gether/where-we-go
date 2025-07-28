package com.example.wherewego.domain.courses.entity;

import java.util.List;

import com.example.wherewego.common.entity.BaseEntity;
import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 여행 코스 엔티티
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "courses")
public class Course extends BaseEntity {

	/**
	 * 코스 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "course_id")
	private Long id;

	/**
	 * 코스 작성자
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	/**
	 * 코스 제목
	 */
	@Column(name = "title", nullable = false, length = 100)
	private String title;

	/**
	 * 코스 설명
	 */
	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	/**
	 * 코스 테마 (로맨틱, 힐링, 액티비티 등)
	 */
	@ElementCollection(fetch = FetchType.LAZY)
	@Enumerated(EnumType.STRING)
	@Column(name = "theme", length = 50)
	private List<CourseTheme> themes;

	/**
	 * 지역 (서울, 부산, 제주 등)
	 */
	@Column(name = "region", nullable = false, length = 50)
	private String region;

	/**
	 * 좋아요 수
	 */
	@Column(name = "like_count", nullable = false)
	@Builder.Default
	private Integer likeCount = 0;

	/**
	 * 평균 평점 (0.00 ~ 5.00)
	 */
	@Column(name = "average_rating", nullable = false)
	@Builder.Default
	private Double averageRating = (double)0L;

	/**
	 * 조회수
	 */
	@Column(name = "view_count", nullable = false)
	@Builder.Default
	private Integer viewCount = 0;

	/**
	 * 북마크 수
	 */
	@Column(name = "bookmark_count", nullable = false)
	@Builder.Default
	private Integer bookmarkCount = 0;

	/**
	 * 댓글 수
	 */
	@Column(name = "comment_count", nullable = false)
	@Builder.Default
	private Integer commentCount = 0;

	/**
	 * 일일 인기 점수
	 */
	@Column(name = "daily_score", nullable = false)
	@Builder.Default
	private Integer dailyScore = 0;

	/**
	 * 삭제 여부
	 */
	@Column(name = "is_deleted", nullable = false)
	@Builder.Default
	private Boolean isDeleted = false;

	/**
	 * 공개 여부 (기본값: 비공개)
	 */
	@Column(name = "is_public", nullable = false)
	@Builder.Default
	private Boolean isPublic = false;

	public Course(String title, String region, boolean isPublic) {
		super();
	}

	/**
	 * 코스 수정 기능
	 */
	public Course updateCourseInfoFromRequest(String title, String description,
		List<CourseTheme> themes, String region, Boolean isPublic) {
		this.title = title;
		this.description = description;
		this.themes = themes;
		this.region = region;
		this.isPublic = (isPublic != null) ? isPublic : false;

		return this;
	}

	// === 카운트 관련 메서드 ===

	/**
	 * 좋아요 수 증가
	 */
	public void incrementLikeCount() {
		this.likeCount++;
	}

	/**
	 * 좋아요 수 감소
	 */
	public void decrementLikeCount() {
		if (this.likeCount > 0) {
			this.likeCount--;
		}
	}

	/**
	 * 조회수 증가
	 */
	public void incrementViewCount() {
		this.viewCount++;
	}

	/**
	 * 북마크 수 증가
	 */
	public void incrementBookmarkCount() {
		this.bookmarkCount++;
	}

	/**
	 * 북마크 수 감소
	 */
	public void decrementBookmarkCount() {
		if (this.bookmarkCount > 0) {
			this.bookmarkCount--;
		}
	}

	/**
	 * 댓글 수 증가
	 */
	public void incrementCommentCount() {
		this.commentCount++;
	}

	/**
	 * 댓글 수 감소
	 */
	public void decrementCommentCount() {
		if (this.commentCount > 0) {
			this.commentCount--;
		}
	}

	/**
	 * 평균 평점 업데이트
	 */
	public void updateAverageRating(Double newAverageRating) {
		this.averageRating = newAverageRating;
	}

	/**
	 * 일일 인기 점수 업데이트
	 */
	public void updateDailyScore(Integer newDailyScore) {
		this.dailyScore = newDailyScore;
	}

	public void setId(long l) {
	}
}