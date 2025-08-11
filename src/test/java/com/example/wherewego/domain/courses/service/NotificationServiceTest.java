package com.example.wherewego.domain.courses.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.example.wherewego.domain.common.enums.NotificationType;
import com.example.wherewego.domain.courses.dto.request.NotificationRequestDto;
import com.example.wherewego.domain.courses.dto.response.NotificationResponseDto;
import com.example.wherewego.domain.courses.entity.Notification;
import com.example.wherewego.domain.courses.repository.NotificationRepository;

class NotificationServiceTest {

	@Mock
	private NotificationRepository notificationRepository;

	@InjectMocks
	private NotificationService notificationService;

	@BeforeEach
	void setup() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void createNotification_성공() {

		// given
		NotificationRequestDto request = new NotificationRequestDto(1L, NotificationType.LIKE);
		Notification notification = Notification.builder()
			.receiverId(1L)
			.type(NotificationType.LIKE)
			.message("회원님의 코스에 좋아요가 추가되었습니다.")
			.build();

		when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

		// when
		NotificationResponseDto result = notificationService.createNotification(request);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getReceiverId()).isEqualTo(1L);
		assertThat(result.getType()).isEqualTo(NotificationType.LIKE);
		assertThat(result.getMessage()).contains("좋아요");
		verify(notificationRepository, times(1)).save(any(Notification.class));

	}

	@Test
	void getUserNotifications_성공() {
		// given
		Long userId = 1L;
		Pageable pageable = PageRequest.of(0, 2, Sort.by("createdAt").descending());

		Notification n1 = Notification.builder()
			.receiverId(userId)
			.type(NotificationType.COMMENT)
			.message("댓글이 달렸습니다")
			.build();

		Notification n2 = Notification.builder()
			.receiverId(userId)
			.type(NotificationType.LIKE)
			.message("좋아요가 등록되었습니다")
			.build();

		Page<Notification> page = new PageImpl<>(List.of(n1, n2), pageable, 2);

		when(notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId, pageable)).thenReturn(page);

		// when
		var response = notificationService.getUserNotifications(userId, pageable);

		// then
		assertThat(response.getContent()).hasSize(2);
		assertThat(response.getContent().get(0).getReceiverId()).isEqualTo(userId);
	}

	@Test
	void markAsRead_성공() {
		// given
		Long notiId = 100L;
		Long userId = 200L;

		Notification notification = Notification.builder()
			.id(notiId)
			.receiverId(userId)
			.type(NotificationType.LIKE)
			.isRead(false)
			.message("msg")
			.build();

		when(notificationRepository.findById(notiId)).thenReturn(Optional.of(notification));

		// when
		NotificationResponseDto result = notificationService.markAsRead(notiId, userId);

		// then
		assertThat(result.isRead()).isTrue();
	}

	@Test
	void getUnreadCount_성공() {
		// given
		Long userId = 1L;
		when(notificationRepository.countByReceiverIdAndIsReadFalse(userId)).thenReturn(3L);

		// when
		long cnt = notificationService.getUnreadCount(userId);

		// then
		assertThat(cnt).isEqualTo(3L);
	}

}