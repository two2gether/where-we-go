package com.example.wherewego.global.config;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.wherewego.domain.auth.enums.Provider;
import com.example.wherewego.domain.auth.enums.UserRole;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminInit {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@PostConstruct
	public void adminInit() {
		String adminEmail = "admin@example.com";
		if (userRepository.findByEmailAndIsDeletedFalse(adminEmail).isEmpty()) {
			User admin = User.builder()
				.email(adminEmail)
				.password(passwordEncoder.encode("Password123!"))
				.nickname("관리자")
				.provider(Provider.LOCAL)
				.role(UserRole.ADMIN)
				.build();
			userRepository.save(admin);
			System.out.println("관리자 계정 생성 완료!");
		} else {
			System.out.println("이미 관리자 계정이 있습니다.");
		}
	}
}
