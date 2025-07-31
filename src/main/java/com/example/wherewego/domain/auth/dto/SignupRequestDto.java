package com.example.wherewego.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDto {

	@Email(message = "유효한 이메일 주소여야 합니다.")
	@NotBlank(message = "이메일은 필수 입력값입니다.")
	private String email;

	@NotBlank(message = "비밀번호는 필수 입력값입니다.")
	// 최소 8자, 영문 대/소문자, 숫자, 특수문자 포함
	@Pattern(
		regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{8,20}$",
		message = "비밀번호는 최소 8자, 영문 대·소문자, 숫자, 특수문자를 포함해야 합니다."
	)
	private String password;

	@NotBlank(message = "닉네임은 필수 입력값입니다.")
	@Size(min = 2, max = 20, message = "닉네임은 2~20자 사이여야 합니다.")
	private String nickname;

	private String profileImage;
}