package com.example.wherewego.domain.user.entity;

import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.common.entity.BaseEntity;

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

/**
 * 사용자 정보를 저장하는 엔티티
 * 로컬 회원가입 및 소셜 로그인 사용자 정보를 관리합니다.
 */
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User extends BaseEntity {

	/**
	 * 사용자 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/**
	 * 사용자 이메일 주소
	 */
	@Column(nullable = false, unique = true, length = 100)
	private String email;

	/**
	 * 사용자 비밀번호 (소셜 로그인시 null 허용)
	 */
	@Column(nullable = false, length = 255)
	private String password;  // 소셜 로그인시 null 허용

	/**
	 * 사용자 닉네임
	 */
	@Column(nullable = false, length = 20)
	private String nickname;

	/**
	 * 사용자 프로필 이미지 URL
	 */
	@Column(length = 500, name = "profile_image")
	private String profileImage;

	/**
	 * 로그인 제공자 (LOCAL, GOOGLE, KAKAO 등)
	 */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Provider provider;

	/**
	 * 소셜 로그인 제공자의 사용자 ID
	 */
	@Column(length = 100, name = "provider_id")
	private String providerId;

	public void setIsDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public void changePassword(String encodedPassword) {
		this.password = encodedPassword;
	}

	public void changeNickname(String nickname) {
		this.nickname = nickname;
	}

	public void changeProfileImage(String profileImage) {
		this.profileImage = profileImage;
	}

}
