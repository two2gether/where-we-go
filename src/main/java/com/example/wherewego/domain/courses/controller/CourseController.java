package com.example.wherewego.domain.courses.controller;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/courses")
public class CourseController {
    // 속성
    private final CourseService courseService;

    /**
     * 코스 생성 api
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseCreateResponseDto>> registerCourse(
            @RequestBody @Valid CourseCreateRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        Long userId = userDetail.getUser().getId();

        CourseCreateResponseDto responseDto = courseService.createCourse(requestDto, userId);

        return ResponseEntity.ok(ApiResponse.ok("코스가 성공적으로 생성되었습니다.", responseDto));
    }


}
