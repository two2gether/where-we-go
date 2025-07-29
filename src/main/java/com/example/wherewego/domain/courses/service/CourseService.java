package com.example.wherewego.domain.courses.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.request.CourseUpdateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDeleteResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.dto.response.CourseUpdateResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.PlacesOrder;
import com.example.wherewego.domain.courses.mapper.CourseMapper;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.courses.repository.PlaceRepository;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {

	private final CourseRepository courseRepository;
	private final UserRepository userRepository;
	private final PlaceService placeService;
	private final PlaceRepository placeRepository;

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
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		// 2. 엔티티 만들기[요청 DTO -> 엔티티 변환]
		// CourseCreateRequestDto + User -> Course 엔티티 생성(Mapper 사용)
		Course course = CourseMapper.toEntity(requestDto, user);

		// 3. 저장하기 - 변환된 Course 엔티티를 DB에 저장
		Course savedCourse = courseRepository.save(course);

		// requestDto 안에 리스트 placeIds 가져오기
		List<String> placeIds = requestDto.getPlaceIds();

		// placesOrder 엔티티 만들기
		List<PlacesOrder> placesOrders = new ArrayList<>();

		for (int i = 0; i < placeIds.size(); i++) {
			PlacesOrder placesOrder = PlacesOrder.builder()
				.courseId(savedCourse.getId())
				.placeId(placeIds.get(i))
				.visitOrder(i + 1)
				.build();

			placesOrders.add(placesOrder);
		}

		// 저장하기
		placeRepository.saveAll(placesOrders);

		return CourseMapper.toDto(savedCourse);
	}

	/**
	 * 코스 목록 조회 api
	 * @param filterDto : 지역, 테마 조건을 담은 dto.
	 */
	@Transactional(readOnly = true)
	public PagedResponse<CourseListResponseDto> getCourseList(
		CourseListFilterDto filterDto,
		Pageable pageable
	) {
		// 1. 데이터 준비
		String region = filterDto.getRegion();
		List<CourseTheme> themes = filterDto.getThemes();

		// 2. 조건에 따라 코스 목록 조회
		// Fetch Join으로 전체 리스트 조회
		List<Course> courseList;
		if (themes != null && !themes.isEmpty()) {
			// 테마가 있을 경우 : 지역+테마 조건으로 조회
			courseList = courseRepository.findByRegionAndThemesInAndIsPublicTrue(region, themes);
		} else {
			// 테마가 없을 경우 : 지역 조건만으로 조회
			courseList = courseRepository.findByRegionAndIsPublicTrue(region);
		}

		// 3. 페이징 처리
		int offset = (int)pageable.getOffset(); // 시작 인덱스
		int limit = pageable.getPageSize(); // 가져올 개수
		int total = courseList.size(); // 전체 개수

		List<Course> paged = courseList.stream()
			.skip(offset)
			.limit(limit)
			.toList();

		// 4. [엔티티 -> 응답 dto 변환] (map 활용)
		// 조회된 Course -> CourseListResponseDto (Mapper 사용)
		List<CourseListResponseDto> dtoList = paged.stream()
			.map(CourseMapper::toList)
			.toList();

		// 5. PageImpl 로 Page 객체 생성
		Page<CourseListResponseDto> dtoPage = new PageImpl<>(dtoList, pageable, total);

		// 6. 커스텀 페이징 응답 dto 로 변환 후 반환
		return PagedResponse.from(dtoPage);
	}

	/**
	 * 코스 상세 조회 api
	 */
	@Transactional(readOnly = true)
	public CourseDetailResponseDto getCourseDetail(
		Long courseId,
		Double userLatitude,
		Double userLongitude
	) {
		// 1. 코스 조회
		Course findCourse = courseRepository.findByIdWithThemes(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		// 1-2. 장소 조회
		List<PlacesOrder> placesOrder = placeRepository.findByCourseIdOrderByVisitOrderAsc(courseId);

		List<String> placeIds = placesOrder.stream()
			.map(order -> order.getPlaceId())
			.collect(Collectors.toList());

		List<CoursePlaceInfo> placesForCourseWithRoute = placeService.getPlacesForCourseWithRoute(placeIds,
			userLatitude, userLongitude);

		CourseDetailResponseDto responseDto = CourseDetailResponseDto.builder()
			.courseId(findCourse.getId())
			.title(findCourse.getTitle())
			.description(findCourse.getDescription())
			.region(findCourse.getRegion())
			.themes(findCourse.getThemes())
			.places(placesForCourseWithRoute)
			.likeCount(findCourse.getLikeCount())
			.averageRating(findCourse.getAverageRating())
			.isPublic(findCourse.getIsPublic())
			.createdAt(findCourse.getCreatedAt())
			.build();

		// 2. dto 반환하기[엔티티 -> 응답 dto 변환]
		// return CourseMapper.toDetailDto(findCourse, places);
		return responseDto;
	}

	/**
	 * 코스 수정 api
	 */
	@Transactional
	public CourseUpdateResponseDto updateCourseInfo(
		Long courseId,
		CourseUpdateRequestDto requestDto
	) {
		// 1. 수정할 코스 DB 에서 조회.
		Course findCourse = courseRepository.findById(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		// 2. 코스 업데이트
		Course updatedCourse = findCourse.updateCourseInfoFromRequest(
			requestDto.getTitle(),
			requestDto.getDescription(),
			requestDto.getThemes(),
			requestDto.getRegion(),
			requestDto.getIsPublic()
		);

		// 3. dto 반환하기[엔티티 -> 응답 dto 변환]
		return CourseMapper.toUpdateDto(updatedCourse);
	}

	/**
	 * 코스 삭제 api
	 */
	@Transactional
	public CourseDeleteResponseDto deleteCourseById(
		Long courseId,
		Long userId
	) {
		// 1. 코스 조회하기
		Course findCourse = courseRepository.findById(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		// 2. 사용자 권한 체크 - 본인 코스만 삭제할 수 있게
		if (!findCourse.getUser().getId().equals(userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_COURSE_ACCESS);
		}

		findCourse.softDelete();

		return CourseMapper.toDeleteResponseDto(findCourse);
	}

	public Course getCourseById(Long id) {
		return courseRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
	}

	/**
	 * 인기 코스 목록 조회 api
	 * => 이번 달 북마크 수 기준
	 */
	@Transactional(readOnly = true)
	public PagedResponse<CourseListResponseDto> getPopularCourseList(
		CourseListFilterDto filterDto,
		Pageable pageable
	) {
		// 1. 데이터 준비
		String region = filterDto.getRegion();
		List<CourseTheme> themes = filterDto.getThemes();

		// 1-2. 이번 달 시작 날짜 구하기 + 오늘까지
		LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
		LocalDateTime now = LocalDateTime.now();

		// 2. 조건에 따라 인기 코스 조회
		// 정렬 : 이번 달 북마크 수 내림차순
		Page<Course> coursePage;
		if (themes != null && !themes.isEmpty()) {
			coursePage = courseRepository.findPopularCoursesByRegionAndThemesThisMonth(
				region, themes, startOfMonth, now, pageable
			);
		} else {
			coursePage = courseRepository.findPopularCoursesByRegionThisMonth(
				region, startOfMonth, now, pageable
			);
		}

		// 3. 조건에 따라 인기 코스 조회
		// 정렬 : 이번 달 북마크 수 내림차순
		// List<Course> popularCourses = courseRepository.findPopularCoursesByMonth(region, themes, startOfMonth);

		// 3. 페이징 처리
		// int offset = (int)pageable.getOffset();
		// int limit = pageable.getPageSize();
		// int total = popularCourseIds.size();
		//
		// List<Long> pagedIds = popularCourseIds.stream()
		// 	.skip(offset)
		// 	.limit(limit)
		// 	.toList();

		// 4. Id로 Course 엔티티 가져오기 (북마크 포함)
		// List<Course> popularCourses = courseRepository.findByIdIn(pagedIds);

		// 5. [엔티티 -> 응답 dto 변환]
		List<CourseListResponseDto> dtoList = coursePage.stream()
			.map(CourseMapper::toList)
			.toList();

		// 6. PageImpl 로 Page 객체 생성
		Page<CourseListResponseDto> dtoPage = new PageImpl<>(dtoList, pageable, coursePage.getTotalElements());

		// 7. 커스텀 페이징 응답 dto 로 변환 후 반환
		return PagedResponse.from(dtoPage);
	}

	// 내가 만든 코스 목록 조회
	@Transactional(readOnly = true)
	public PagedResponse<CourseListResponseDto> getCoursesByUser(Long userId, Pageable pageable) {
		Page<Course> page = courseRepository.findByUserIdAndIsDeletedFalse(userId, pageable);

		List<CourseListResponseDto> dtoList = page.getContent().stream()
			.map(CourseMapper::toList)
			.toList();

		Page<CourseListResponseDto> dtoPage = new PageImpl<>(dtoList, pageable, page.getTotalElements());

		return PagedResponse.from(dtoPage);
	}
}
