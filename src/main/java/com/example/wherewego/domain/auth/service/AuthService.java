package com.example.wherewego.domain.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.auth.dto.LoginRequestDto;
import com.example.wherewego.domain.auth.dto.LoginResponseDto;
import com.example.wherewego.domain.auth.dto.SignupRequestDto;
import com.example.wherewego.domain.auth.security.JwtUtil;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.domain.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final UserService userService;
	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;

	public UserResponseDto signup(SignupRequestDto request) {
		if (!request.getPassword().equals(request.getConfirmPassword())) {
			throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
		}
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
		}

		User user = User.builder()
			.email(request.getEmail())
			.password(passwordEncoder.encode(request.getPassword()))
			.nickname(request.getNickname())
			.profileImage(request.getProfileImage())
			.provider(Provider.LOCAL)
			.build();

		User saved = userRepository.save(user);
		return userService.toDto(saved);

	}

	public LoginResponseDto login(LoginRequestDto request) {
		// Spring Security 인증 (사용자 존재 여부 + 비밀번호 검증)
		Authentication auth = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
		authenticationManager.authenticate(auth);

		// 인증 성공 시 JWT 토큰 생성
		String token = jwtUtil.generateToken(request.getEmail());

		return LoginResponseDto.builder()
			.token(token)
			.build();
	}

}
