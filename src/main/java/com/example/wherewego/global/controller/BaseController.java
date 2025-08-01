package com.example.wherewego.global.controller;

import com.example.wherewego.global.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletResponse;

/**
 * 컨트롤러 베이스 클래스
 * HTTP 상태 코드 설정을 위한 헬퍼 메서드 제공
 */
public abstract class BaseController {

    /**
     * 201 Created 응답
     */
    protected <T> ApiResponse<T> created(String message, T data) {
        setResponseStatus(HttpStatus.CREATED);
        return ApiResponse.created(message, data);
    }

    /**
     * 204 No Content 응답
     */
    protected <T> ApiResponse<T> noContent(String message) {
        setResponseStatus(HttpStatus.NO_CONTENT);
        return ApiResponse.noContent(message);
    }

    /**
     * 200 OK 응답 (기본값)
     */
    protected <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.ok(message, data);
    }

    /**
     * HTTP 응답 상태 코드 설정
     */
    private void setResponseStatus(HttpStatus status) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletResponse response = attributes.getResponse();
            if (response != null) {
                response.setStatus(status.value());
            }
        }
    }
}