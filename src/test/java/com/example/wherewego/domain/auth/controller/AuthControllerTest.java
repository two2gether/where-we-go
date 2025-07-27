package com.example.wherewego.domain.auth.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.mockito.BDDMockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.wherewego.domain.auth.dto.LoginRequestDto;
import com.example.wherewego.domain.auth.dto.LoginResponseDto;
import com.example.wherewego.domain.auth.dto.SignupRequestDto;
import com.example.wherewego.domain.auth.security.TokenBlacklistService;
import com.example.wherewego.domain.auth.service.AuthService;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean // 경고나오지만 실행은 가능
	private AuthService authService;

	@MockBean // 경고나오지만 실행은 가능
	private TokenBlacklistService blacklistService;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void 회원가입성공() throws Exception {
		// given
		SignupRequestDto request = SignupRequestDto.builder()
			.email("test@example.com")
			.password("Password123!")
			.confirmPassword("Password123!")
			.nickname("테스터")
			.build();

		UserResponseDto response = UserResponseDto.builder()
			.email("test@example.com")
			.nickname("테스터")
			.profileImage(null)
			.build();

		BDDMockito.given(authService.signup(any(SignupRequestDto.class)))
			.willReturn(response);

		// when & then
		mockMvc.perform(post("/api/auth/signup")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request)))
			.andExpect(status().isCreated());
	}

	@Test
	void 로그인성공() throws Exception {

		// given
		LoginRequestDto request = LoginRequestDto.builder()
			.email("test@example.com")
			.password("Password123!")
			.build();

		LoginResponseDto response = LoginResponseDto.builder()
			.token("mock-jwt-token")
			.build();

		BDDMockito.given(authService.login(any(LoginRequestDto.class)))
			.willReturn(response);

		// when & then
		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.token").value("mock-jwt-token"));
	}

	@Test
	void 로그아웃성공() throws Exception {

		// given
		String token = "mock-jwt-token";
		String bearerToken = "Bearer " + token;

		BDDMockito.willDoNothing()
			.given(blacklistService)
			.blacklist(token);

		// when & then
		mockMvc.perform(post("/api/auth/logout")
				.header("Authorization", bearerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value("로그아웃 성공"))
			.andExpect(jsonPath("$.data").doesNotExist());
	}
}
