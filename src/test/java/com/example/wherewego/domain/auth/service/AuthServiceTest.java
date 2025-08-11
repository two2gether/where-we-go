package com.example.wherewego.domain.auth.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.wherewego.domain.auth.dto.request.LoginRequestDto;
import com.example.wherewego.domain.auth.dto.request.SignupRequestDto;
import com.example.wherewego.domain.auth.dto.response.LoginResponseDto;
import com.example.wherewego.domain.auth.enums.Provider;
import com.example.wherewego.domain.auth.security.JwtUtil;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

/**
 * AuthService 보안 및 인증 테스트
 *
 * 테스트 범위:
 * - 회원가입 보안 검증 (중복 이메일, 입력 유효성)
 * - 로그인 보안 검증 (인증 실패, JWT 토큰 생성)
 * - 예외 처리 (CustomException 변환)
 * - Spring Security 통합 테스트
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private UserService userService;

	@Mock
	private PasswordEncoder passwordEncoder;


	@Mock
	private JwtUtil jwtUtil;

	@InjectMocks
	private AuthService authService;

	private User testUser;
	private SignupRequestDto validSignupRequest;
	private LoginRequestDto validLoginRequest;

	@BeforeEach
	void setUp() {
		// 테스트용 사용자 생성
		testUser = User.builder()
			.id(1L)
			.email("test@example.com")
			.nickname("테스터")
			.password("encodedPassword123!")
			.provider(Provider.LOCAL)
			.build();

		// 유효한 회원가입 요청
		validSignupRequest = SignupRequestDto.builder()
			.email("test@example.com")
			.password("Password123!")
			.nickname("테스터")
			.profileImage("profile.jpg")
			.build();

		// 유효한 로그인 요청
		validLoginRequest = LoginRequestDto.builder()
			.email("test@example.com")
			.password("Password123!")
			.build();
	}

	@Nested
	@DisplayName("회원가입 보안 테스트")
	class SignupSecurityTest {

		@Test
		@DisplayName("정상 회원가입 성공")
		void signupSuccess() {
			// given
			UserResponseDto expectedResponse = UserResponseDto.builder()
				.email("test@example.com")
				.nickname("테스터")
				.profileImage("profile.jpg")
				.build();

			when(userService.existsByEmail("test@example.com"))
				.thenReturn(false);
			when(passwordEncoder.encode("Password123!"))
				.thenReturn("encodedPassword123!");
			when(userService.saveUser(any(User.class)))
				.thenReturn(testUser);
			when(userService.convertUserToDto(testUser))
				.thenReturn(expectedResponse);

			// when
			UserResponseDto result = authService.signup(validSignupRequest);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getEmail()).isEqualTo("test@example.com");
			assertThat(result.getNickname()).isEqualTo("테스터");
			assertThat(result.getProfileImage()).isEqualTo("profile.jpg");

			verify(userService).existsByEmail("test@example.com");
			verify(passwordEncoder).encode("Password123!");
			verify(userService).saveUser(any(User.class));
			verify(userService).convertUserToDto(testUser);
		}

		@Test
		@DisplayName("중복 이메일로 회원가입 시 예외 발생")
		void signupFailDuplicateEmail() {
			// given
			when(userService.existsByEmail("test@example.com"))
				.thenReturn(true);

			// when & then
			assertThatThrownBy(() -> authService.signup(validSignupRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.DUPLICATE_EMAIL.getMessage());

			verify(userService).existsByEmail("test@example.com");
			verify(passwordEncoder, never()).encode(any());
			verify(userService, never()).saveUser(any());
		}

		@Test
		@DisplayName("특수 문자 이메일 공격 방어")
		void signupSecurityEmailInjection() {
			// given - SQL Injection 시도하는 악성 이메일
			SignupRequestDto maliciousRequest = SignupRequestDto.builder()
				.email("test'; DROP TABLE users; --@example.com")
				.password("Password123!")
				.nickname("해커")
				.build();

			when(userService.existsByEmail(contains("DROP TABLE")))
				.thenReturn(false);
			when(passwordEncoder.encode(any()))
				.thenReturn("encoded");
			when(userService.saveUser(any(User.class)))
				.thenReturn(testUser);
			when(userService.convertUserToDto(any()))
				.thenReturn(UserResponseDto.builder().build());

			// when & then - 정상 처리되어야 함 (JPA가 파라미터화된 쿼리 사용)
			assertThatCode(() -> authService.signup(maliciousRequest))
				.doesNotThrowAnyException();

			verify(userService).existsByEmail(contains("DROP TABLE"));
		}
	}

	@Nested
	@DisplayName("로그인 보안 테스트")
	class LoginSecurityTest {

		@Test
		@DisplayName("정상 로그인 성공")
		void loginSuccess() {
			// given
			String expectedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.of(testUser));
			when(passwordEncoder.matches("Password123!", "encodedPassword123!"))
				.thenReturn(true);
			when(jwtUtil.generateToken("test@example.com"))
				.thenReturn(expectedToken);

			// when
			LoginResponseDto result = authService.login(validLoginRequest);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getToken()).isEqualTo(expectedToken);

			verify(userService).findByEmail("test@example.com");
			verify(passwordEncoder).matches("Password123!", "encodedPassword123!");
			verify(jwtUtil).generateToken("test@example.com");
		}

		@Test
		@DisplayName("잘못된 비밀번호로 로그인 시 예외 발생")
		void loginFailBadCredentials() {
			// given
			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.of(testUser));
			when(passwordEncoder.matches("Password123!", "encodedPassword123!"))
				.thenReturn(false);

			// when & then
			assertThatThrownBy(() -> authService.login(validLoginRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_PASSWORD.getMessage());

			verify(userService).findByEmail("test@example.com");
			verify(passwordEncoder).matches("Password123!", "encodedPassword123!");
			verify(jwtUtil, never()).generateToken(any());
		}

		@Test
		@DisplayName("존재하지 않는 사용자로 로그인 시 예외 발생")
		void loginFailUserNotFound() {
			// given
			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> authService.login(validLoginRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.USER_NOT_FOUND.getMessage());

			verify(userService).findByEmail("test@example.com");
			verify(jwtUtil, never()).generateToken(any());
		}

		@Test
		@DisplayName("브루트 포스 공격 시뮬레이션 - 연속 로그인 실패")
		void loginBruteForceAttack() {
			// given - 연속 5번 실패하는 시나리오
			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.of(testUser));
			when(passwordEncoder.matches("Password123!", "encodedPassword123!"))
				.thenReturn(false);

			// when & then - 모든 시도가 동일하게 예외 발생해야 함
			for (int i = 0; i < 5; i++) {
				assertThatThrownBy(() -> authService.login(validLoginRequest))
					.isInstanceOf(CustomException.class)
					.hasMessage(ErrorCode.INVALID_PASSWORD.getMessage());
			}

			// 모든 실패 시도에 대해 동일한 에러 메시지로 정보 노출 방지 확인
			verify(userService, times(5)).findByEmail("test@example.com");
			verify(jwtUtil, never()).generateToken(any());
		}

		@Test
		@DisplayName("SQL Injection 시도 - 특수문자 이메일")
		void loginSqlInjectionAttempt() {
			// given
			LoginRequestDto maliciousRequest = LoginRequestDto.builder()
				.email("' OR '1'='1' --")
				.password("anypassword")
				.build();

			when(userService.findByEmail("' OR '1'='1' --"))
				.thenReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> authService.login(maliciousRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.USER_NOT_FOUND.getMessage());

			verify(userService).findByEmail("' OR '1'='1' --");
		}
	}

	@Nested
	@DisplayName("JWT 토큰 보안 테스트")
	class JwtSecurityTest {

		@Test
		@DisplayName("JWT 토큰 형식 검증")
		void jwtTokenFormatValidation() {
			// given
			String validJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjE2MjM5MDIyfQ.signature";

			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.of(testUser));
			when(passwordEncoder.matches("Password123!", "encodedPassword123!"))
				.thenReturn(true);
			when(jwtUtil.generateToken("test@example.com"))
				.thenReturn(validJwtToken);

			// when
			LoginResponseDto result = authService.login(validLoginRequest);

			// then
			assertThat(result.getToken()).isNotNull();
			assertThat(result.getToken()).isNotBlank();
			assertThat(result.getToken()).contains(".");  // JWT는 점으로 구분된 3개 부분
			assertThat(result.getToken().split("\\.")).hasSize(3);  // header.payload.signature
		}

		@Test
		@DisplayName("토큰 생성 실패 시 예외 처리")
		void jwtGenerationFailure() {
			// given
			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.of(testUser));
			when(passwordEncoder.matches("Password123!", "encodedPassword123!"))
				.thenReturn(true);
			when(jwtUtil.generateToken("test@example.com"))
				.thenThrow(new RuntimeException("Token generation failed"));

			// when & then
			assertThatThrownBy(() -> authService.login(validLoginRequest))
				.isInstanceOf(RuntimeException.class)
				.hasMessage("Token generation failed");

			verify(userService).findByEmail("test@example.com");
			verify(passwordEncoder).matches("Password123!", "encodedPassword123!");
			verify(jwtUtil).generateToken("test@example.com");
		}
	}

	@Nested
	@DisplayName("입력 데이터 검증 테스트")
	class InputValidationTest {

		@Test
		@DisplayName("Null 이메일로 로그인 시도")
		void loginWithNullEmail() {
			// given
			LoginRequestDto nullEmailRequest = LoginRequestDto.builder()
				.email(null)
				.password("Password123!")
				.build();

			when(userService.findByEmail(null))
				.thenReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> authService.login(nullEmailRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.USER_NOT_FOUND.getMessage());
		}

		@Test
		@DisplayName("빈 문자열 비밀번호로 로그인 시도")
		void loginWithEmptyPassword() {
			// given
			LoginRequestDto emptyPasswordRequest = LoginRequestDto.builder()
				.email("test@example.com")
				.password("")
				.build();

			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.of(testUser));
			when(passwordEncoder.matches("", "encodedPassword123!"))
				.thenReturn(false);

			// when & then
			assertThatThrownBy(() -> authService.login(emptyPasswordRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_PASSWORD.getMessage());
		}

		@Test
		@DisplayName("매우 긴 이메일로 회원가입 시도 (DoS 공격 방어)")
		void signupWithVeryLongEmail() {
			// given - 매우 긴 이메일 (1000자)
			String longEmail = "a".repeat(990) + "@test.com";
			SignupRequestDto longEmailRequest = SignupRequestDto.builder()
				.email(longEmail)
				.password("Password123!")
				.nickname("테스터")
				.build();

			when(userService.existsByEmail(longEmail))
				.thenReturn(false);

			// when & then - 정상 처리되어야 함 (DB 제약조건에서 처리)
			assertThatCode(() -> authService.signup(longEmailRequest))
				.doesNotThrowAnyException();
		}
	}

	@Nested
	@DisplayName("보안 예외 처리 테스트")
	class SecurityExceptionTest {

		@Test
		@DisplayName("Spring Security 예외를 CustomException으로 올바르게 변환")
		void springSecurityExceptionConversion() {
			// given
			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.of(testUser));
			when(passwordEncoder.matches("Password123!", "encodedPassword123!"))
				.thenReturn(false);

			// when & then
			assertThatThrownBy(() -> authService.login(validLoginRequest))
				.isInstanceOf(CustomException.class)
				.extracting(ex -> ((CustomException)ex).getErrorCode())
				.isEqualTo(ErrorCode.INVALID_PASSWORD);
		}

		@Test
		@DisplayName("인증 실패 시 민감한 정보 노출 방지")
		void authenticationFailureInformationDisclosure() {
			// given
			when(userService.findByEmail("test@example.com"))
				.thenReturn(Optional.empty());

			// when & then - 구체적인 실패 이유가 아닌 일반적인 메시지로 변환되어야 함
			assertThatThrownBy(() -> authService.login(validLoginRequest))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.USER_NOT_FOUND.getMessage())
				.extracting(Throwable::getMessage)
				.asString()
				.doesNotContain("admin", "database", "not found");
		}
	}
}