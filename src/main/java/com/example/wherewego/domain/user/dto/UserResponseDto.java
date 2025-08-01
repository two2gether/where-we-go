package com.example.wherewego.domain.user.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자 응답 DTO
 * 사용자 정보를 클라이언트에 전달하는 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    /**
     * 사용자 고유 식별자
     */
    private Long id;
    /**
     * 사용자 이메일 주소
     */
    private String email;
    /**
     * 사용자 닉네임
     */
    private String nickname;
    /**
     * 사용자 프로필 이미지 URL
     */
    private String profileImage;

    /**
     * 계정 생성 일시
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING,
            pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'",
            timezone = "UTC")
    private LocalDateTime createdAt;
}
