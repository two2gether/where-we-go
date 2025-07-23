package com.example.wherewego.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class MyPageUpdateRequestDto {

	@NotBlank
	@Pattern(
		regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{8,20}$",
		message = "비밀번호는 최소 8자, 최대20자, 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다."
	)
	private String password;

	@NotBlank
	@Size(min = 2, max = 20, message = "닉네임은 2~20자 사이여야 합니다.")
	private String nickname;

	private String profileImage;
}
