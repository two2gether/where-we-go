package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.courses.dto.request.NotificationRequestDto;
import com.example.wherewego.domain.courses.dto.response.NotificationResponseDto;
import com.example.wherewego.domain.courses.entity.Notification;
import com.example.wherewego.domain.courses.repository.NotificationRepository;

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
		// 알림 엔티티 생성
		Notification notification = Notification.builder()
			.receiverId(request.getReceiverId())
			.courseId(request.getCourseId())
			.type(request.getType())
			.message(request.getMessage())
			.build();

		// DB에 저장
		notificationRepository.save(notification);

		// 응답 DTO로 변환하여 반환
		return toDto(notification);
	}

	/**
	 * Notification 엔티티를 DTO로 변환합니다.
	 */
	private NotificationResponseDto toDto(Notification notification) {
		return NotificationResponseDto.of(notification);
	}

}
