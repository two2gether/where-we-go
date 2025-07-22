package com.example.wherewego.domain.auth.controller;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.dto.LoginRequestDto;
import com.example.wherewego.domain.auth.dto.LoginResponseDto;
import com.example.wherewego.domain.auth.dto.SignupRequestDto;
import com.example.wherewego.domain.auth.security.TokenBlacklistService;
import com.example.wherewego.domain.auth.service.AuthService;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final TokenBlacklistService blacklistService;

	@PostMapping("/signup")
	public ResponseEntity<ApiResponse<UserResponseDto>> signup(@Validated @RequestBody SignupRequestDto dto) {

		UserResponseDto userDto = authService.signup(dto);

		ApiResponse<UserResponseDto> response = ApiResponse.<UserResponseDto>builder()
			.success(true)
			.message("회원 가입 성공")
			.data(userDto)
			.timestamp(LocalDateTime.now())
			.build();

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<LoginResponseDto>> login(
		@Validated @RequestBody LoginRequestDto dto
	) {
		LoginResponseDto loginDto = authService.login(dto);

		ApiResponse<LoginResponseDto> resp = ApiResponse.<LoginResponseDto>builder()
			.success(true)
			.message("로그인 성공")
			.data(loginDto)
			.timestamp(LocalDateTime.now())
			.build();

		return ResponseEntity.ok(resp);
	}

	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<Void>> logout(
		@RequestHeader(value = "Authorization", required = false) String header
	) {
		String token = header.replaceFirst("^Bearer ", "");
		blacklistService.blacklist(token);

		ApiResponse<Void> resp = ApiResponse.<Void>builder()
			.success(true)
			.message("로그아웃 성공")
			.timestamp(LocalDateTime.now())
			.build();

		return ResponseEntity.ok(resp);
	}
}
