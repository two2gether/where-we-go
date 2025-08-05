package com.example.wherewego.domain.auth.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.dto.request.GoogleUserInfo;
import com.example.wherewego.domain.auth.dto.request.KakaoUserInfo;
import com.example.wherewego.domain.auth.dto.request.LoginRequestDto;
import com.example.wherewego.domain.auth.dto.request.LoginResponseDto;
import com.example.wherewego.domain.auth.dto.request.SignupRequestDto;
import com.example.wherewego.domain.auth.security.JwtUtil;
import com.example.wherewego.domain.auth.security.TokenBlacklistService;
import com.example.wherewego.domain.auth.service.AuthService;
import com.example.wherewego.domain.auth.service.GoogleOAuthService;
import com.example.wherewego.domain.auth.service.KakaoOAuthService;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.response.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * 사용자 인증 및 인가 REST API 컨트롤러
 *
 * 애플리케이션의 사용자 인증 및 인가 기능을 총괄적으로 관리합니다.
 * 회원가입, 로그인, 로그아웃 기능과 JWT 토큰 기반 인증 시스템을 제공합니다.
 * Spring Security와 통합되어 보안성을 보장하며, 토큰 블랙리스트 관리 기능을 포함합니다.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final TokenBlacklistService tokenBlacklistService;
	private final GoogleOAuthService googleOAuthService;
	private final UserService userService;
	private final JwtUtil jwtUtil;
	private final KakaoOAuthService kakaoOAuthService;

	/**
	 * 새로운 사용자 회원가입을 처리합니다.
	 * 이메일 중복 검사 및 비밀번호 암호화를 수행합니다.
	 *
	 * @param request 회원가입 요청 데이터
	 * @return 생성된 사용자 정보를 포함한 API 응답
	 */
	@PostMapping("/signup")
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<UserResponseDto> signup(@Validated @RequestBody SignupRequestDto request) {
		UserResponseDto response = authService.signup(request);

		return ApiResponse.created("회원 가입 성공", response);
	}

	/**
	 * 사용자 로그인을 처리하고 JWT 토큰을 발급합니다.
	 * Spring Security를 통해 인증을 수행합니다.
	 *
	 * @param request 로그인 요청 데이터 (이메일, 비밀번호)
	 * @return JWT 토큰을 포함한 API 응답
	 */
	@PostMapping("/login")
	public ApiResponse<LoginResponseDto> login(
		@Validated @RequestBody LoginRequestDto request
	) {
		LoginResponseDto response = authService.login(request);

		return ApiResponse.ok("로그인 성공", response);
	}

	/**
	 * 사용자 로그아웃 API
	 *
	 * POST /api/auth/logout
	 *
	 * 인증된 사용자의 로그아웃을 처리하고 JWT 토큰을 블랙리스트에 추가합니다.
	 * 토큰을 블랙리스트에 추가하여 더 이상 사용할 수 없도록 하고,
	 * 클라이언트에서는 저장된 토큰을 삭제하여 완전한 로그아웃을 완료해야 합니다.
	 *
	 * @param header Authorization 헤더 (무효한 토큰이나 누락된 경우도 처리 가능)
	 * @return 빈 응답과 성공 메시지
	 */
	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ApiResponse<Void> logout(
		@RequestHeader(value = "Authorization", required = false) String header
	) {
		String token = header.replaceFirst("^Bearer ", "");
		tokenBlacklistService.blacklist(token);

		return ApiResponse.noContent("로그아웃 성공");
	}

	@GetMapping("/googlelogin")
	public ApiResponse<LoginResponseDto> googleLogin(@RequestParam String code) {
		// 1 . 구글 액세스 토큰 요청
		String accessToken = googleOAuthService.getAccessToken(code);

		// 2. 구글 사용자 정보 가져오기
		GoogleUserInfo userInfo = googleOAuthService.getUserInfo(accessToken);

		// 3. 회원 조회 또는 신규 회원 생성
		User user = userService.findOrCreateUser(userInfo);

		// 4. JWT 토큰 생성
		String jwt = jwtUtil.generateToken(user.getEmail());

		// 5. ApiResponse로 반환
		return ApiResponse.ok("로그인 성공", new LoginResponseDto(jwt));

	}

	@GetMapping("/kakaologin")
	public ApiResponse<LoginResponseDto> kakaoLogin(@RequestParam String code) {
		// 1. 카카오 액세스 토큰 요청
		String accessToken = kakaoOAuthService.getAccessToken(code);

		// 2. 카카오 사용자 정보 가져오기
		Map<String, Object> userInfoMap = kakaoOAuthService.getUserInfo(accessToken);
		KakaoUserInfo kakaoUserInfo = new KakaoUserInfo(userInfoMap);

		// 3. 회원 조회 또는 신규 회원 생성
		User user = userService.findOrCreateUser(kakaoUserInfo);

		// 4. JWT 토큰 생성
		String jwt = jwtUtil.generateToken(user.getEmail());

		// 5. ApiResponse로 반환
		return ApiResponse.ok("로그인 성공", new LoginResponseDto(jwt));
	}

}
