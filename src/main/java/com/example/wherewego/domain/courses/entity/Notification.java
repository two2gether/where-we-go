package com.example.wherewego.domain.courses.entity;

import com.example.wherewego.domain.common.entity.BaseEntity;
import com.example.wherewego.domain.common.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "notifications")
public class Notification extends BaseEntity {

	/**
	 * 알림 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "notification_id")
	private Long id;

	/**
	 * 알림 받는 사용자 id
	 */
	@Column(name = "receiver_id", nullable = false)
	private Long receiverId;

	/**
	 * 관련된 코스 id
	 */
	@Column(name = "course_id", nullable = false)
	private Long courseId;

	/**
	 * 알림 유형 (LIKE, COMMENT)
	 */
	@Enumerated(EnumType.STRING)
	@Column(name = "type", nullable = false, length = 50)
	private NotificationType type;

	/**
	 * 알림 메시지 본문
	 */
	@Column(name = "message", nullable = false, columnDefinition = "TEXT")
	private String message;

	/**
	 * 읽음 여부 (기본값: false)
	 */
	@Column(name = "is_read", nullable = false)
	private boolean isRead = false;

	/**
	 * 알림을 읽음 상태로 변경
	 */
	public void markAsRead() {
		this.isRead = true;
	}

}
