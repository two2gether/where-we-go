package com.example.wherewego.domain.auth.controller;


import com.example.wherewego.domain.auth.dto.LoginRequestDto;
import com.example.wherewego.domain.auth.dto.LoginResponseDto;
import com.example.wherewego.domain.auth.dto.SignupRequestDto;
import com.example.wherewego.domain.auth.service.AuthService;
import com.example.wherewego.domain.user.dto.UserResponseDto;
import com.example.wherewego.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDto>> signup(@Validated @RequestBody SignupRequestDto dto) {

        UserResponseDto userDto = authService.signup(dto);

        ApiResponse<UserResponseDto> response = ApiResponse.<UserResponseDto>builder()
                .success(true)
                .message("회원 가입 성공")
                .data(userDto)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(
            @Validated @RequestBody LoginRequestDto dto
    ) {
        LoginResponseDto loginDto = authService.login(dto);

        ApiResponse<LoginResponseDto> resp = ApiResponse.<LoginResponseDto>builder()
                .success(true)
                .message("로그인 성공")
                .data(loginDto)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(resp);
    }
}
