package com.example.wherewego.domain.courses.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.NotificationType;
import com.example.wherewego.domain.courses.dto.request.NotificationRequestDto;
import com.example.wherewego.domain.courses.dto.response.NotificationResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.Notification;
import com.example.wherewego.domain.courses.repository.NotificationRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

	private final NotificationRepository notificationRepository;

	/**
	 * 알림을 생성합니다.
	 *
	 * @param request 알림 생성 요청 정보
	 * @return 생성된 알림 응답 DTO
	 */
	@Transactional
	public NotificationResponseDto createNotification(NotificationRequestDto request) {
		//메세지 생성
		String message = generateMessage(request);

		// 알림 엔티티 생성
		Notification notification = Notification.builder()
			.receiverId(request.getReceiverId())
			.type(request.getType())
			.message(message)
			.build();

		// DB에 저장
		notificationRepository.save(notification);

		// 응답 DTO로 변환하여 반환
		return toDto(notification);
	}

	/**
	 * 특정 사용자에 대한 알림 목록을 페이지네이션하여 조회합니다.
	 *
	 * @param userId   알림을 받을 사용자 ID
	 * @param pageable 페이지네이션 정보
	 * @return 알림 응답 DTO 페이지 객체
	 */
	public PagedResponse<NotificationResponseDto> getUserNotifications(Long userId, Pageable pageable) {
		Page<Notification> page = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId, pageable);

		// 엔티티 → DTO 변환
		List<NotificationResponseDto> dtoList = page.getContent().stream()
			.map(NotificationResponseDto::of)
			.toList();

		// PageImpl로 감싸기
		Page<NotificationResponseDto> dtoPage = new PageImpl<>(dtoList, pageable, page.getTotalElements());

		// PagedResponse로 반환
		return PagedResponse.from(dtoPage);
	}

	/**
	 * 알림 메시지 생성 로직, type 기반
	 */
	private String generateMessage(NotificationRequestDto request) {

		return switch (request.getType()) {
			case COMMENT -> "회원님의 코스에 댓글이 달렸습니다.";
			case LIKE -> "회원님의 코스에 좋아요가 추가되었습니다.";
			default -> throw new CustomException(ErrorCode.INVALID_NOTIFICATION_TYPE);
		};
	}

	/**
	 * 댓글 생성 시 알림 발생하는 메서드
	 */
	public void triggerCommentNotification(User commenter, Course course) {
		if (commenter.getId().equals(course.getUser().getId()))
			return;

		NotificationRequestDto request = new NotificationRequestDto(
			course.getUser().getId(),
			NotificationType.COMMENT
		);

		createNotification(request);
	}

	/**
	 * 좋아요 생성 시 알림 발생하는 메서드
	 */
	public void triggerLikeNotification(User liker, Course course) {
		if (liker.getId().equals(course.getUser().getId()))
			return;

		NotificationRequestDto request = new NotificationRequestDto(
			course.getUser().getId(),
			NotificationType.LIKE
		);

		createNotification(request);
	}

	/**
	 * 알림 읽음 처리
	 */
	@Transactional
	public NotificationResponseDto markAsRead(Long notificationId, Long userId) {
		// 1. 알림 조회
		Notification notification = notificationRepository.findByIdAndReceiverId(notificationId, userId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));

		// 3. 이미 읽음이면 그냥 반환
		if (!notification.isRead()) {
			notification.markAsRead(); // isRead = true
		}

		// 4. DTO 변환 및 반환
		return NotificationResponseDto.of(notification);
	}

	/**
	 * 읽지 않은 알림 갯수 조회
	 */
	public long getUnreadCount(Long userId) {
		return notificationRepository.countByReceiverIdAndIsReadFalse(userId);
	}

	/**
	 * Notification 엔티티를 DTO로 변환합니다.
	 */
	private NotificationResponseDto toDto(Notification notification) {
		return NotificationResponseDto.of(notification);
	}

}
