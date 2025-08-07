package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;

import com.example.wherewego.domain.common.enums.NotificationType;
import com.example.wherewego.domain.courses.entity.Notification;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 알림 응답 DTO
 * 생성되거나 조회된 알림 정보를 반환할 때 사용하는 응답 데이터 클래스입니다.
 */
@Getter
@AllArgsConstructor
public class NotificationResponseDto {

	/**
	 * 알림 고유 식별자
	 */
	private Long notificationId;

	/**
	 * 알림 수신자 ID
	 */
	private Long receiverId;

	/**
	 * 알림 유형 (LIKE, COMMENT)
	 */
	private NotificationType type;

	/**
	 * 알림 메시지
	 */
	private String message;

	/**
	 * 읽음 여부
	 */
	private boolean isRead;

	/**
	 * 생성 일시
	 */
	private LocalDateTime createdAt;

	public static NotificationResponseDto of(Notification notification) {
		return new NotificationResponseDto(
			notification.getId(),
			notification.getReceiverId(),
			notification.getType(),
			notification.getMessage(),
			notification.isRead(),
			notification.getCreatedAt()
		);
	}
}
