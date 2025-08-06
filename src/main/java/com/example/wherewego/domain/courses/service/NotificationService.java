package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.NotificationType;
import com.example.wherewego.domain.courses.dto.request.NotificationRequestDto;
import com.example.wherewego.domain.courses.dto.response.NotificationResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.Notification;
import com.example.wherewego.domain.courses.repository.NotificationRepository;
import com.example.wherewego.domain.user.entity.User;

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
			.courseId(request.getCourseId())
			.type(request.getType())
			.message(message)
			.build();

		// DB에 저장
		notificationRepository.save(notification);

		// 응답 DTO로 변환하여 반환
		return toDto(notification);
	}

	/**
	 * 알림 메시지 생성 로직, type 기반
	 */
	private String generateMessage(NotificationRequestDto request) {
		return switch (request.getType()) {
			case COMMENT -> "회원님의 코스에 댓글이 달렸습니다.";
			case LIKE -> "회원님의 코스에 좋아요가 추가되었습니다.";
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
			course.getId(),
			NotificationType.COMMENT
		);

		createNotification(request);
	}

	/**
	 * Notification 엔티티를 DTO로 변환합니다.
	 */
	private NotificationResponseDto toDto(Notification notification) {
		return NotificationResponseDto.of(notification);
	}

}
