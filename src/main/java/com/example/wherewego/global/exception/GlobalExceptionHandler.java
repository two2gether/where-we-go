package com.example.wherewego.global.exception;

import com.example.wherewego.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.HttpStatus;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;



@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 커스텀 예외(BaseException) 처리
     * 서비스, 도메인 계층 등에서 발생한 비즈니스 예외를 처리합니다.
     *
     * @param e CustomException (커스텀 예외 클래스)
     * @return 공통응답객체를 통한 일괄적인 응답형식
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException e) {
        log.error("비즈니스 예외 발생", e);
        return ResponseEntity.status(e.getErrorCode().getStatus()).body(ApiResponse.error(e.getErrorCode().getMessage()));
    }

    /**
     * Valid 어노테이션 검증 실패 시 발생하는 예외 처리
     *
     * @param e MethodArgumentNotValidException
     * @return 공통응답객체의 오류 메시지를 포함한 응답 (HTTP 400 Bad Request)
     * 첫 번째 예외메세지만 반환
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("유효성 검사에 실패했습니다.");

        log.error("유효성 검사 실패: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(message));
    }

    /**
     * IllegalArgumentException 처리
     * 주로 잘못된 파라미터나 조건 위반 등에서 발생
     *
     * @param e IllegalArgumentException
     * @return 공통응답객체를 통한 일괄적인 응답형식  (HTTP 400 Bad Request)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException e) {
        log.error("잘못된 요청: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
    }

    /**
     * Spring Security - 잘못된 인증 정보 예외 처리
     * 비밀번호 불일치, 사용자 없음 등의 인증 실패를 처리합니다.
     */
    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationFailure(Exception e) {
        log.error("로그인 실패 - 인증 오류: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("이메일 또는 비밀번호가 올바르지 않습니다."));
    }

    /**
     * HTTP 메서드 지원하지 않는 경우 처리
     * 주로 잘못된 HTTP 메서드 호출시 발생 (예: POST만 지원하는 엔드포인트에 GET 요청)
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        // 요청 정보를 더 자세히 로깅 (디버깅용)
        log.warn("지원하지 않는 HTTP 메서드 요청: {} → 지원 메서드: {}", 
                e.getMethod(), 
                String.join(", ", e.getSupportedMethods() != null ? e.getSupportedMethods() : new String[]{"없음"}));
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(ApiResponse.error("지원하지 않는 HTTP 메서드입니다."));
    }

    /**
     * Exception 처리
     * 서버오류를 처리
     *
     * @param e Exception
     * @return 공통응답객체를 통한 일괄적인 응답형식
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("서버 내부 오류", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("서버 오류가 발생했습니다."));
    }
}
