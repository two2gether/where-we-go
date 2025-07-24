package com.example.wherewego.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequestDto {

	@NotBlank(message = "비밀번호를 입력하세요")
	@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{8,20}$",
		message = "비밀번호는 최소 8자,최대 20자 대문자·소문자·숫자·특수문자를 포함해야 합니다."
	)
	private String password;
}
