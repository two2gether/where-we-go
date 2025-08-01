package com.example.wherewego.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원가입 요청 DTO
 * 사용자 회원가입 시 필요한 정보를 받는 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDto {

	/**
	 * 회원가입에 사용할 이메일 주소
	 */
	@Email(message = "유효한 이메일 주소여야 합니다.")
	@NotBlank(message = "이메일은 필수 입력값입니다.")
	private String email;

	/**
	 * 회원가입에 사용할 비밀번호 (최소 8자, 영문 대/소문자, 숫자, 특수문자 포함)
	 */
	@NotBlank(message = "비밀번호는 필수 입력값입니다.")
	// 최소 8자, 영문 대/소문자, 숫자, 특수문자 포함
	@Pattern(
		regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{8,20}$",
		message = "비밀번호는 최소 8자, 영문 대·소문자, 숫자, 특수문자를 포함해야 합니다."
	)
	private String password;

	/**
	 * 사용자 닉네임 (2~20자)
	 */
	@NotBlank(message = "닉네임은 필수 입력값입니다.")
	@Size(min = 2, max = 20, message = "닉네임은 2~20자 사이여야 합니다.")
	private String nickname;

	/**
	 * 사용자 프로필 이미지 URL
	 */
	private String profileImage;
}