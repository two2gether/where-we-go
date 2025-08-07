package com.example.wherewego.domain.courses.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.courses.dto.request.NotificationRequestDto;
import com.example.wherewego.domain.courses.dto.response.NotificationResponseDto;
import com.example.wherewego.domain.courses.service.NotificationService;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationService notificationService;

	/**
	 * 알림 생성 API
	 *
	 * POST /api/notifications
	 *
	 * 특정 사용자에게 알림을 생성합니다.
	 * 알림은 관련된 메시지, 알림 타입 정보를 포함하여 저장됩니다.
	 *
	 * @param requestDto 알림 생성 요청 데이터
	 * @return 생성된 알림 정보
	 */
	@PostMapping("/api/notifications")
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<NotificationResponseDto> createNotification(
		@RequestBody @Valid NotificationRequestDto requestDto) {

		NotificationResponseDto responseDto = notificationService.createNotification(requestDto);
		return ApiResponse.ok("알림이 성공적으로 생성되었습니다.", responseDto);
	}

}

