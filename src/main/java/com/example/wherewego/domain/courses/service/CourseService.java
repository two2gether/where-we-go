package com.example.wherewego.domain.courses.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.mapper.CourseMapper;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

	private final CourseRepository courseRepository;
	private final UserRepository userRepository;

	/**
	 * 코스 생성 api
	 */
	@Transactional
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

	/**
	 * 코스 목록 조회 api
	 * @param filterDto : 지역, 테마 조건을 담은 dto.
	 */
	public PagedResponse<CourseListResponseDto> getCourseList(
		CourseListFilterDto filterDto,
		Pageable pageable
	) {
		// 1. 데이터 준비
		String region = filterDto.getRegion();
		List<CourseTheme> themes = filterDto.getThemes();

		Page<Course> coursePage; // Page 객체 생성

		// 2. 조건에 따라 코스 목록 조회
		if (themes != null && !themes.isEmpty()) {
			// 테마가 있을 경우 : 지역+테마 조건으로 조회
			coursePage = courseRepository.findByRegionAndThemesInAndIsPublicTrue(region, themes, pageable);
		} else {
			// 테마가 없을 경우 : 지역 조건만으로 조회
			coursePage = courseRepository.findByRegionAndIsPublicTrue(region, pageable);
		}

		// 3. [엔티티 -> 응답 dto 변환] (map 활용)
		// 조회된 Course -> CourseListResponseDto (Mapper 사용)
		Page<CourseListResponseDto> dtoPage = coursePage.map(CourseMapper::toList);

		// 4. 커스텀 페이징 응답 dto 로 변환 후 반환
		return PagedResponse.from(dtoPage);
	}
}
