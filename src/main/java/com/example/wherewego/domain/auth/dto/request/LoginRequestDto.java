package com.example.wherewego.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 로그인 요청 DTO
 * 사용자 로그인 시 이메일과 비밀번호를 받는 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDto {
	/**
	 * 로그인에 사용할 이메일 주소
	 */
	@Email(message = "유효한 이메일을 입력하세요")
	@NotBlank(message = "이메일은 필수입니다")
	private String email;

	/**
	 * 로그인에 사용할 비밀번호
	 */
	@NotBlank(message = "비밀번호는 필수입니다")
	private String password;
}