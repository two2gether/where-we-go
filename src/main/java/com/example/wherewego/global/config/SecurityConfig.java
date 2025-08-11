package com.example.wherewego.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
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

	/**
	 * 공개 API용 Security Filter Chain (인증 불필요)
	 * 우선순위가 높아 먼저 매칭됨
	 */
	@Bean
	@Order(1)
	public SecurityFilterChain publicApiFilterChain(HttpSecurity http) throws Exception {
		return http
			.securityMatcher(
				"/health", "/actuator/health",
				"/api/auth/**", "/error"
			)
			.authorizeHttpRequests(auth -> auth
				.anyRequest().permitAll()
			)
			.csrf(csrf -> csrf.disable())
			.sessionManagement(session ->
				session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			.build();
	}

	/**
	 * 인증 필요 API용 Security Filter Chain (일부 Course GET API는 공개)
	 */
	@Bean
	@Order(2)
	public SecurityFilterChain privateApiFilterChain(HttpSecurity http) throws Exception {
		return http
			.authorizeHttpRequests(auth -> auth
				// 공개 코스 조회 API (JWT Filter 거치지만 permitAll)
				.requestMatchers(HttpMethod.GET, "/api/courses").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/courses/*").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/courses/*/comments").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/courses/popular").permitAll()

				// 나머지 모든 요청은 인증 필요
				.anyRequest().authenticated()
			)
			.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
			.csrf(csrf -> csrf.disable())
			.sessionManagement(session ->
				session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			.build();
	}

	@Bean
	public JwtAuthenticationFilter jwtAuthenticationFilter() {
		return new JwtAuthenticationFilter(jwtUtil, userDetailsService, tokenBlacklistService);
	}

}
