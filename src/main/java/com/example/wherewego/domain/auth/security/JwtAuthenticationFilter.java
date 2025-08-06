package com.example.wherewego.domain.auth.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final JwtUtil jwtUtil;
	private final CustomUserDetailsService userDetailsService;
	private final TokenBlacklistService tokenBlacklistService;

	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {
		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7);

			// 1) 블랙리스트에 올라간 토큰인지 확인
			if (tokenBlacklistService.isBlacklisted(token)) {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been logged out");
				return;
			}

			// 2) 토큰 유효성 검사
			try {
				if (!jwtUtil.validateToken(token)) {
					response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT");
					return;
				}

				String email = jwtUtil.getSubject(token);
				UserDetails userDetails;
				try {
					userDetails = userDetailsService.loadUserByUsername(email);
				} catch (UsernameNotFoundException e) {
					response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
					return;
				}

				if (!userDetails.isEnabled()) {
					response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User is disabled");
					return;
				}

				UsernamePasswordAuthenticationToken auth =
					new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
				SecurityContextHolder.getContext().setAuthentication(auth);

			} catch (JwtException e) {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT");
				return;
			}
		} else {
			// Authorization 헤더가 없거나 Bearer로 시작하지 않는 경우
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
			return;
		}

		filterChain.doFilter(request, response);
	}
}