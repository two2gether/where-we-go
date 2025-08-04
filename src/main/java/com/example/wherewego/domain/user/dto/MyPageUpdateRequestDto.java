package com.example.wherewego.domain.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

/**
 * 마이페이지 정보 수정 요청 DTO
 * 사용자가 프로필 정보를 수정할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@Builder
public class MyPageUpdateRequestDto {

	/**
	 * 수정할 비밀번호 (최소 8자, 최대 20자, 대문자·소문자·숫자·특수문자 포함)
	 */
	@Pattern(
		regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{8,20}$",
		message = "비밀번호는 최소 8자, 최대20자, 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다."
	)
	private String password;

	/**
	 * 수정할 닉네임 (2~20자)
	 */
	@Size(min = 2, max = 20, message = "닉네임은 2~20자 사이여야 합니다.")
	private String nickname;

	/**
	 * 수정할 프로필 이미지 URL
	 */
	private String profileImage;

}
