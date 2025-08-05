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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 댓글 정보를 저장하는 엔티티
 * 사용자가 작성한 코스에 대한 댓글을 관리합니다.
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "course_comments")
public class Comment extends BaseEntity {

	/**
	 * 댓글 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/**
	 * 댓글 작성자
	 */
	@ManyToOne  // 유저를 항상 조회해서 닉네임을 가져와야 하기 떄문에 디폴인 EAGER 설정
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	/**
	 * 연관된 코스
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "course_id", nullable = false)
	private Course course;

	/**
	 * 댓글 내용
	 */
	@Column(columnDefinition = "TEXT", nullable = false)
	private String content;

	/**
	 * 댓글 수정
	 */
	public void updateContent(String content) {
		this.content = content;
	}

}