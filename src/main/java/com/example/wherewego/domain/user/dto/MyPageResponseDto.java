package com.example.wherewego.domain.user.dto;

import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.user.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 마이페이지 응답 DTO
 * 사용자의 마이페이지 정보를 반환할 때 사용하는 응답 데이터 클래스입니다.
 */
@Getter
@Builder
@AllArgsConstructor
public class MyPageResponseDto {
	/**
	 * 사용자 고유 식별자
	 */
	private Long userId;
	/**
	 * 사용자 닉네임
	 */
	private String nickname;
	/**
	 * 사용자 이메일 주소
	 */
	private String email;
	/**
	 * 사용자 프로필 이미지 URL
	 */
	private String profileImage;
	/**
	 * 소셜 로그인 제공자 (예: GOOGLE, NAVER, LOCAL)
	 */
	private Provider provider;
	/**
	 * 계정 생성 일시
	 */
	private String createdAt;
	/**
	 * 계정 정보 수정 일시
	 */
	private String updatedAt;

	public static MyPageResponseDto fromEntity(User user) {
		return MyPageResponseDto.builder()
			.userId(user.getId())
			.nickname(user.getNickname())
			.email(user.getEmail())
			.profileImage(user.getProfileImage())
			.provider(user.getProvider())
			.createdAt(user.getCreatedAt().toString())
			.updatedAt(user.getUpdatedAt().toString())
			.build();
	}
}
