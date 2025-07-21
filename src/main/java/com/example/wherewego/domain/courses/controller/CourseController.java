package com.example.wherewego.domain.courses.controller;

import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    // 속성
    private final CourseService courseService;

    // 기능
    // 코스 생성
    @PostMapping
    public ResponseEntity<ApiResponse<CourseCreateResponseDto>> registerCourse(
            @RequestBody @Valid CourseCreateRequestDto requestDto
    ) {
        CourseCreateResponseDto responseDto = courseService.createCourse(requestDto, userId);

        return ResponseEntity.ok(ApiResponse.ok("코스가 성공적으로 생성되었습니다.", responseDto));
    }
}
