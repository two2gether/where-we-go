package com.example.wherewego.global.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Getter;

/**
 * API 응답을 위한 공통 응답 형식
 * 표준화된 API 응답 구조를 제공합니다.
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<Object> {

	/**
	 * 응답 메시지
	 */
	private final String message;

	/**
	 * 응답 데이터
	 */
	private final Object data;

	/**
	 * 응답 생성 시간
	 */
	private final LocalDateTime timestamp;

	private ApiResponse(String message, Object data) {
		this.message = message;
		this.data = data;
		this.timestamp = LocalDateTime.now();
	}

	/**
	 * 성공 응답을 생성합니다.
	 *
	 * @param message 응답 메시지
	 * @param data 응답 데이터
	 * @return 성공 응답
	 */
	public static <T> ApiResponse<T> ok(String message, T data) {
		return new ApiResponse<>(message, data);
	}

	/**
	 * 생성 성공 응답을 생성합니다. (201 Created용)
	 *
	 * @param message 응답 메시지
	 * @param data 응답 데이터
	 * @return 생성 성공 응답
	 */
	public static <T> ApiResponse<T> created(String message, T data) {
		return new ApiResponse<>(message, data);
	}

	/**
	 * 수정 성공 응답을 생성합니다. (204 No Content용)
	 *
	 * @param message 응답 메시지
	 * @return 수정 성공 응답
	 */
	public static <T> ApiResponse<T> noContent(String message) {
		return new ApiResponse<>(message, null);
	}

	/**
	 * 에러 응답을 생성합니다.
	 *
	 * @param message 에러 메시지
	 * @return 에러 응답
	 */
	public static <T> ApiResponse<T> error(String message) {
		return new ApiResponse<>(message, null);
	}
}