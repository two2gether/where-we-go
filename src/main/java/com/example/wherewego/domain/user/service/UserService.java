package com.example.wherewego.domain.user.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.auth.security.TokenBlacklistService;
import com.example.wherewego.domain.user.dto.MyPageResponseDto;
import com.example.wherewego.domain.user.dto.MyPageUpdateRequestDto;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final TokenBlacklistService tokenBlacklistService;
	private final PasswordEncoder passwordEncoder;

	@Transactional
	public void withdraw(Long userId,
		@NotBlank(message = "비밀번호를 입력하세요")
		@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,20}$", message = "비밀번호는 최소 8자,최대 20자 대문자·소문자·숫자·특수문자를 포함해야 합니다."
		) String password) {

		User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		if (!passwordEncoder.matches(password, user.getPassword())) {
			throw new BadCredentialsException("비밀번호가 올바르지 않습니다.");
		}

		// 토큰을 블랙리스트에 등록
		tokenBlacklistService.blacklistTokensForUser(userId);

		// 소프트 딜리트
		user.setIsDeleted(true);
		userRepository.save(user);
	}

	@Transactional
	public MyPageResponseDto myPage(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		return MyPageResponseDto.builder()
			.userId(user.getId())
			.nickname(user.getNickname())
			.email(user.getEmail())
			.profileImage(user.getProfileImage())
			.provider(user.getProvider())
			.providerId(user.getProviderId())
			.createdAt(user.getCreatedAt().toString())
			.updatedAt(user.getUpdatedAt().toString())
			.build();

	}

	@Transactional
	public MyPageResponseDto updateMyPage(Long userId, MyPageUpdateRequestDto dto) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 1) password 가 넘어왔을 때만 변경
		if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
			String encoded = passwordEncoder.encode(dto.getPassword());
			user.changePassword(encoded);
		}

		// 2) nickname 이 넘어왔을 때만 변경
		if (dto.getNickname() != null && !dto.getNickname().isBlank()) {
			user.changeNickname(dto.getNickname());
		}

		// 3) profileImage 가 넘어왔을 때만 변경
		if (dto.getProfileImage() != null && !dto.getProfileImage().isBlank()) {
			user.changeProfileImage(dto.getProfileImage());
		}

		return MyPageResponseDto.fromEntity(user);
	}

	public UserResponseDto toDto(User u) {
		return UserResponseDto.builder()
			.id(u.getId())
			.email(u.getEmail())
			.nickname(u.getNickname())
			.profileImage(u.getProfileImage())
			.createdAt(u.getCreatedAt())
			.build();

	}

	public User getUserById(Long id) {
		return userRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
	}

}
