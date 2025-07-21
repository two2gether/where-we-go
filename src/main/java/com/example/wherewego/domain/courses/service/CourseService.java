package com.example.wherewego.domain.courses.service;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.mapper.CourseMapper;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {
    // 속성
    private final CourseRepository courseRepository;

    // 기능
    @Transactional
    // 코스 생성
    public CourseCreateResponseDto createCourse(
            CourseCreateRequestDto requestDto,
            Long userId
    ) {
        // 1. 사용자 조회 - userId로 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 엔티티 만들기[요청 DTO -> 엔티티 변환]
        // CourseCreateRequestDto + User -> Course 엔티티 생성(Mapper 사용)
        Course course = CourseMapper.toEntity(requestDto, user);

        // 3. 저장하기 - 변환된 Course 엔티티를 DB에 저장
        Course savedCourse = courseRepository.save(course);

        // 4. dto 반환하기[엔티티 -> 응답 dto 변환]
        // 저장된 Course -> CourseCreateResponseDto 로 변환(Mapper 사용)
        return CourseMapper.toDto(savedCourse);
    }
}
