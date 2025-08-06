package com.example.wherewego.domain.courses.dto.request;

import com.example.wherewego.domain.common.enums.NotificationType;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationRequestDto {

	@NotNull
	private Long receiverId;

	@NotNull
	private Long courseId;

	@NotNull
	private NotificationType type;

}
