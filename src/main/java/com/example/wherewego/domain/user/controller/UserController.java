package com.example.wherewego.domain.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.user.dto.MyPageResponseDto;
import com.example.wherewego.domain.user.dto.MyPageUpdateRequestDto;
import com.example.wherewego.domain.user.dto.WithdrawRequestDto;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

	private final UserService userService;

	@DeleteMapping("/withdraw")
	public ResponseEntity<ApiResponse<Void>> withdraw(
		@AuthenticationPrincipal CustomUserDetail userDetails,
		@Valid @RequestBody WithdrawRequestDto dto
	) {

		userService.withdraw(userDetails.getId(), dto.getPassword());
		return ResponseEntity.ok(
			ApiResponse.ok("회원 탈퇴가 완료되었습니다.", null)
		);
	}

	@GetMapping("/mypage")
	public ResponseEntity<ApiResponse<MyPageResponseDto>> myPage(
		@AuthenticationPrincipal CustomUserDetail principal
	) {
		Long userId = principal.getId();

		MyPageResponseDto dto = userService.MyPage(userId);

		ApiResponse<MyPageResponseDto> response = ApiResponse.ok(
			"마이페이지 화면입니다.", dto
		);
		return ResponseEntity.ok(response);
	}

	@PutMapping("/mypage")
	public ResponseEntity<ApiResponse<MyPageResponseDto>> updateMyPage(
		@AuthenticationPrincipal CustomUserDetail principal,
		@Valid @RequestBody MyPageUpdateRequestDto dto
	) {
		MyPageResponseDto updated = userService.updateMyPage(principal.getUser().getId(), dto);
		return ResponseEntity.ok(ApiResponse.ok("프로필이 성공적으로 수정되었습니다.", updated));
	}

}
