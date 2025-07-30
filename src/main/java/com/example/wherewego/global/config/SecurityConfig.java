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
import org.springframework.web.cors.CorsConfigurationSource;

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
	private final CorsConfigurationSource corsConfigurationSource;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			// CSRF 비활성화
			.csrf(csrf -> csrf.disable())

			// CORS 설정
			.cors(cors -> cors.configurationSource(corsConfigurationSource))

			// 람다로 바뀐 세션 설정
			.sessionManagement(session ->
				session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)

			// 인가 설정
			.authorizeHttpRequests(auth -> auth
				// 인증 필요한 API들
				.requestMatchers("/api/users/mypage").authenticated()
				.requestMatchers(HttpMethod.PUT, "/api/users/mypage").authenticated()
				
				// 인증 불필요한 공개 API들
				.requestMatchers("/api/auth/**").permitAll()
				.requestMatchers("/api/places/search").permitAll()
				.requestMatchers("/api/courses/list").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/places/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
				
				// 나머지는 인증 필요
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
