package com.example.wherewego.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원 탈퇴 요청 DTO
 * 사용자가 회원 탈퇴를 요청할 때 비밀번호 확인을 위해 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequestDto {

	/**
	 * 회원 탈퇴 확인을 위한 비밀번호
	 */
	@NotBlank(message = "비밀번호를 입력하세요")
	@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{8,20}$",
		message = "비밀번호는 최소 8자,최대 20자 대문자·소문자·숫자·특수문자를 포함해야 합니다."
	)
	private String password;
}
