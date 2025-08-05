package com.example.wherewego.domain.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.auth.UserRole;
import com.example.wherewego.domain.auth.dto.request.LoginRequestDto;
import com.example.wherewego.domain.auth.dto.request.LoginResponseDto;
import com.example.wherewego.domain.auth.dto.request.SignupRequestDto;
import com.example.wherewego.domain.auth.security.JwtUtil;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

/**
 * 사용자 인증 및 가입 관리 서비스
 * JWT 토큰 기반 인증 시스템을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final UserService userService;
	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;

	/**
	 * 사용자 회원가입을 처리합니다.
	 * 이메일 중복 검사 및 비밀번호 암호화를 수행합니다.
	 *
	 * @param request 회원가입 요청 데이터 (이메일, 비밀번호, 닉네임, 프로필 이미지)
	 * @return 생성된 사용자 정보
	 * @throws CustomException 이미 사용 중인 이메일인 경우
	 */
	public UserResponseDto signup(SignupRequestDto request) {
		if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
			throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
		}

		User user = User.builder()
			.email(request.getEmail())
			.password(passwordEncoder.encode(request.getPassword()))
			.nickname(request.getNickname())
			.profileImage(request.getProfileImage())
			.provider(Provider.LOCAL)
			.role(UserRole.USER) // 관리자 계정 직접 추가할때 -> UserRole.ADMIN
			.build();

		User saved = userRepository.save(user);
		return userService.convertUserToDto(saved);

	}

	/**
	 * 사용자 로그인을 처리하고 JWT 토큰을 발급합니다.
	 * Spring Security를 통해 사용자 인증을 수행합니다.
	 *
	 * @param request 로그인 요청 데이터 (이메일, 비밀번호)
	 * @return JWT 토큰을 포함한 로그인 응답
	 * @throws CustomException 잘못된 인증 정보이거나 사용자를 찾을 수 없는 경우
	 */
	public LoginResponseDto login(LoginRequestDto request) {
		try {
			// Spring Security 인증 (사용자 존재 여부 + 비밀번호 검증)
			Authentication auth = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
			authenticationManager.authenticate(auth);

			// 인증 성공 시 JWT 토큰 생성
			String token = jwtUtil.generateToken(request.getEmail());

			return LoginResponseDto.builder()
				.token(token)
				.build();
		} catch (BadCredentialsException | UsernameNotFoundException e) {
			// Spring Security 예외를 CustomException으로 변환
			throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
		}
	}

}
