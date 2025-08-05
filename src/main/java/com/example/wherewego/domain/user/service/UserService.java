package com.example.wherewego.domain.user.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.auth.UserRole;
import com.example.wherewego.domain.auth.dto.request.GoogleUserInfo;
import com.example.wherewego.domain.auth.dto.request.KakaoUserInfo;
import com.example.wherewego.domain.auth.security.TokenBlacklistService;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.user.dto.MyPageResponseDto;
import com.example.wherewego.domain.user.dto.MyPageUpdateRequestDto;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;

/**
 * 사용자 관리 서비스
 * 마이페이지, 회원탈퇴, 사용자 정보 업데이트 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final TokenBlacklistService tokenBlacklistService;
	private final PasswordEncoder passwordEncoder;

	/**
	 * 사용자 회원탈퇴를 처리합니다.
	 * 비밀번호 확인 후 소프트 삭제를 수행하고 토큰을 블랙리스트에 등록합니다.
	 *
	 * @param userId 탈퇴할 사용자 ID
	 * @param password 확인용 비밀번호
	 * @throws CustomException 사용자를 찾을 수 없거나 비밀번호가 일치하지 않는 경우
	 */
	@Transactional
	public void withdraw(Long userId,
		@NotBlank(message = "비밀번호를 입력하세요")
		@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,20}$", message = "비밀번호는 최소 8자,최대 20자 대문자·소문자·숫자·특수문자를 포함해야 합니다."
		) String password) {

		User user = userRepository.findByIdAndIsDeletedFalse(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		if (!passwordEncoder.matches(password, user.getPassword())) {
			throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
		}

		// 토큰을 블랙리스트에 등록
		tokenBlacklistService.blacklistTokensForUser(userId);

		// 소프트 딜리트
		user.softDelete();
		userRepository.save(user);
	}

	/**
	 * 사용자의 마이페이지 정보를 조회합니다.
	 *
	 * @param userId 조회할 사용자 ID
	 * @return 마이페이지 정보 (닉네임, 이메일, 프로필 이미지 등)
	 * @throws CustomException 사용자를 찾을 수 없는 경우
	 */
	@Transactional
	public MyPageResponseDto getUserProfileInfo(Long userId) {
		User user = userRepository.findByIdAndIsDeletedFalse(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		return MyPageResponseDto.builder()
			.userId(user.getId())
			.nickname(user.getNickname())
			.email(user.getEmail())
			.profileImage(user.getProfileImage())
			.provider(user.getProvider())
			.createdAt(user.getCreatedAt().toString())
			.updatedAt(user.getUpdatedAt().toString())
			.build();

	}

	/**
	 * 사용자의 마이페이지 정보를 업데이트합니다.
	 * 비밀번호, 닉네임, 프로필 이미지를 선택적으로 업데이트할 수 있습니다.
	 *
	 * @param userId 업데이트할 사용자 ID
	 * @param dto 업데이트할 정보 (비밀번호, 닉네임, 프로필 이미지)
	 * @return 업데이트된 마이페이지 정보
	 * @throws CustomException 사용자를 찾을 수 없는 경우
	 */
	@Transactional
	public MyPageResponseDto updateMyPage(Long userId, MyPageUpdateRequestDto dto) {
		User user = userRepository.findByIdAndIsDeletedFalse(userId)
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

	/**
	 * User 엔티티를 UserResponseDto로 변환합니다.
	 *
	 * @param user 변환할 User 엔티티
	 * @return 변환된 UserResponseDto
	 */
	public UserResponseDto convertUserToDto(User user) {
		return UserResponseDto.builder()
			.id(user.getId())
			.email(user.getEmail())
			.nickname(user.getNickname())
			.profileImage(user.getProfileImage())
			.createdAt(user.getCreatedAt())
			.build();

	}

	/**
	 * ID로 사용자를 조회합니다.
	 * 다른 서비스에서 사용하는 내부 메서드입니다.
	 *
	 * @param id 사용자 ID
	 * @return 조회된 User 엔티티
	 * @throws CustomException 사용자를 찾을 수 없는 경우
	 */
	public User getUserById(Long id) {
		return userRepository.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
	}

	public User findOrCreateUser(GoogleUserInfo googleUserInfo) {
		Optional<User> userOptional = userRepository.findByEmailAndIsDeletedFalse(googleUserInfo.getEmail());

		if (userOptional.isPresent()) {
			return userOptional.get();
		} else {
			User newUser = User.builder()
				.email(googleUserInfo.getEmail())
				.nickname(googleUserInfo.getName())
				.password("")
				.provider(Provider.GOOGLE)
				.providerId(googleUserInfo.getId())
				.role(UserRole.USER)
				.build();

			return userRepository.save(newUser);
		}
	}

	public User findOrCreateUser(KakaoUserInfo kakaoUserInfo) {
		String providerId = kakaoUserInfo.getId();

		return userRepository.findByProviderAndProviderId(Provider.KAKAO, providerId)
			.orElseGet(() -> {
				User newUser = User.builder()
					.email("")  // 카카오 이메일이 없으니 빈 문자열로 처리
					.nickname(kakaoUserInfo.getNickname())
					.password("")
					.provider(Provider.KAKAO)
					.providerId(providerId)
					.role(UserRole.USER)
					.build();
				return userRepository.save(newUser);
			});
	}

}
