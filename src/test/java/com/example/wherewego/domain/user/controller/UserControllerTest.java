package com.example.wherewego.domain.user.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.wherewego.domain.auth.Provider;
import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.user.dto.MyPageResponseDto;
import com.example.wherewego.domain.user.dto.MyPageUpdateRequestDto;
import com.example.wherewego.domain.user.dto.WithdrawRequestDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean // 경고나오지만 실행은 가능
	private UserService userService;

	@Autowired
	private ObjectMapper objectMapper;

	/**
	 * SecurityMockMvcRequestPostProcessors.user(...) 에 넘길
	 * CustomUserDetail 을 만드는 헬퍼 메서드
	 */
	private CustomUserDetail mockPrincipal() {
		User u = User.builder()
			.id(1L)
			.email("test@example.com")
			.password("encodedPassword")
			.nickname("테스터")
			.profileImage(null)
			.provider(Provider.LOCAL)
			.build();
		return new CustomUserDetail(u);
	}

	@Test
	void 회원탈퇴_성공() throws Exception {
		// Given
		CustomUserDetail principal = mockPrincipal();
		WithdrawRequestDto reqDto = WithdrawRequestDto.builder()
			.password("Password123!")
			.build();

		willDoNothing().given(userService)
			.withdraw(eq(principal.getId()), eq(reqDto.getPassword()));

		// When & Then
		mockMvc.perform(delete("/api/users/withdraw")
				.with(user(principal))
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(reqDto)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value("회원 탈퇴가 완료되었습니다."));
	}

	@Test
	void 마이페이지조회_성공() throws Exception {
		// Given
		CustomUserDetail principal = mockPrincipal();
		MyPageResponseDto respDto = MyPageResponseDto.builder()
			.userId(1L)
			.email("test@example.com")
			.nickname("테스터")
			.profileImage(null)
			.provider(Provider.LOCAL)
			.providerId(null)
			.createdAt("2025-07-25T00:00:00")
			.updatedAt("2025-07-25T00:00:00")
			.build();
		given(userService.myPage(principal.getId()))
			.willReturn(respDto);

		// When & Then
		mockMvc.perform(get("/api/users/mypage")
				.with(user(principal)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.data.email").value("test@example.com"))
			.andExpect(jsonPath("$.data.nickname").value("테스터"))
			.andExpect(jsonPath("$.data.profileImage").value(Matchers.nullValue()));
	}

	@Test
	void 프로필수정_성공() throws Exception {
		// Given
		CustomUserDetail principal = mockPrincipal();
		MyPageUpdateRequestDto reqDto = MyPageUpdateRequestDto.builder()
			.nickname("수정닉")
			.profileImage("http://example.com/new.png")
			.build();

		MyPageResponseDto respDto = MyPageResponseDto.builder()
			.userId(1L)
			.nickname("수정닉네임")
			.email("test@example.com")
			.profileImage("http://example.com/new.png")
			.provider(Provider.LOCAL)
			.providerId(null)
			.createdAt("2025-01-01T00:00:00")
			.updatedAt("2025-07-25T17:00:00")
			.build();

		given(userService.updateMyPage(1L, reqDto)).willReturn(respDto);

		// When & Then
		mockMvc.perform(put("/api/users/mypage")
				.with(user(principal))
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(reqDto)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value("프로필이 성공적으로 수정되었습니다."));
	}
}
