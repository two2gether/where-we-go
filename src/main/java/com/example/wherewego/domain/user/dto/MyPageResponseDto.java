package com.example.wherewego.domain.user.dto;

import com.example.wherewego.domain.user.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MyPageResponseDto {
	private Long userId;
	private String nickname;
	private String email;
	private String profileImage;
	private String provider;
	private String providerId;
	private String createdAt;
	private String updatedAt;

	public static MyPageResponseDto fromEntity(User user) {
		return MyPageResponseDto.builder()
			.userId(user.getId())
			.nickname(user.getNickname())
			.email(user.getEmail())
			.profileImage(user.getProfileImage())
			.provider(user.getProvider())
			.providerId(user.getProviderId())
			.createdAt(user.getCreatedAt().toString())
			.updatedAt(user.getUpdatedAt().toString())
			.build();
	}
}
