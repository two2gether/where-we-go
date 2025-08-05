package com.example.wherewego.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.wherewego.domain.auth.security.CustomUserDetailsService;
import com.example.wherewego.domain.auth.security.JwtAuthenticationFilter;
import com.example.wherewego.domain.auth.security.JwtUtil;
import com.example.wherewego.domain.auth.security.TokenBlacklistService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {
	private final CustomUserDetailsService userDetailsService;
	private final JwtUtil jwtUtil;
	private final TokenBlacklistService tokenBlacklistService;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			// CSRF 비활성화
			.csrf(csrf -> csrf.disable())

			// 람다로 바뀐 세션 설정
			.sessionManagement(session ->
				session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)

			// 인가 설정
			.authorizeHttpRequests(auth -> auth
				// 헬스체크 엔드포인트는 모든 사용자 접근 허용
				.requestMatchers("/health", "/actuator/health").permitAll()

				// 인증 API는 모든 사용자 접근 허용
				.requestMatchers("/api/auth/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/auth/googlelogin").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/auth/kakaologin").permitAll()

				// 공개 API - 인증 없이 접근 가능
				.requestMatchers(HttpMethod.GET, "/api/courses").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/courses/*").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/courses/*/comments").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/courses/popular").permitAll()

				// 장소 관련 API - 인증 필요
				.requestMatchers("/api/places/**").authenticated()

				// 코스 생성/수정/삭제 - 인증 필요
				.requestMatchers(HttpMethod.POST, "/api/courses").authenticated()
				.requestMatchers(HttpMethod.PATCH, "/api/courses/*").authenticated()
				.requestMatchers(HttpMethod.DELETE, "/api/courses/*").authenticated()

				// 댓글 생성/수정/삭제 - 인증 필요
				.requestMatchers(HttpMethod.POST, "/api/courses/*/comments").authenticated()
				.requestMatchers(HttpMethod.PATCH, "/api/courses/*/comments/*").authenticated()
				.requestMatchers(HttpMethod.DELETE, "/api/courses/*/comments/*").authenticated()

				// 좋아요/북마크/평점 - 인증 필요
				.requestMatchers("/api/courses/*/like").authenticated()
				.requestMatchers("/api/courses/*/bookmark").authenticated()
				.requestMatchers("/api/courses/*/rating").authenticated()

				// 사용자 관련 API - 인증 필요
				.requestMatchers("/api/users/**").authenticated()

				// 기타 모든 요청은 인증 필요
				.anyRequest().authenticated()
			)
			.addFilterBefore(jwtAuthenticationFilter(),
				UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public JwtAuthenticationFilter jwtAuthenticationFilter() {
		return new JwtAuthenticationFilter(jwtUtil, userDetailsService, tokenBlacklistService);
	}

	@Bean
	public AuthenticationManager authenticationManager(
		AuthenticationConfiguration authConfig
	) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
