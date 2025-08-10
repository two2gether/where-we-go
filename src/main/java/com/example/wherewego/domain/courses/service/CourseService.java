package com.example.wherewego.domain.courses.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.CourseTheme;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.request.CourseUpdateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.dto.response.CourseUpdateResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.PlacesOrder;
import com.example.wherewego.domain.courses.mapper.CourseMapper;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.courses.repository.PlacesOrderRepository;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

/**
 * 코스 관리 서비스
 * 여행 코스의 생성, 조회, 수정, 삭제 및 인기 코스 조회 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class CourseService {

	private final CourseRepository courseRepository;
	private final UserService userService;
	private final PlaceService placeService;
	private final PlacesOrderRepository placesOrderRepository;

	/**
	 * 새로운 여행 코스를 생성합니다.
	 *
	 * @param requestDto 코스 생성 요청 데이터 (제목, 설명, 테마, 지역, 장소 목록 등)
	 * @param userId 코스를 생성하는 사용자 ID
	 * @return 생성된 코스 정보를 담은 응답 DTO
	 * @throws CustomException 사용자를 찾을 수 없는 경우
	 */
	@Transactional
	public CourseCreateResponseDto createCourse(
		CourseCreateRequestDto requestDto,
		Long userId
	) {
		// 1. 사용자 조회 - userId로 유저 정보 조회
		User user = userService.getUserById(userId);

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
		placesOrderRepository.saveAll(placesOrders);

		return CourseMapper.toDto(savedCourse);
	}

	/**
	 * 필터 조건에 따라 공개된 코스 목록을 페이징하여 조회합니다.
	 * N+1 쿼리 문제를 해결하기 위해 배치 로딩을 사용합니다.
	 *
	 * @param filterDto 검색 필터 (지역, 테마 조건)
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 페이징된 코스 목록과 메타데이터
	 */
	@Transactional(readOnly = true)
	public PagedResponse<CourseListResponseDto> getCourseList(
		CourseListFilterDto filterDto,
		Pageable pageable
	) {
		// 1. 데이터 준비
		String region = filterDto.getRegion();
		List<CourseTheme> themes = filterDto.getThemes();

		// 2. 성능 최적화된 지역 검색 로직
		Page<Course> coursePage;
		if (themes != null && !themes.isEmpty()) {
			// 테마가 있을 경우: 현재는 기존 로직 유지 (LIKE %region%)
			coursePage = courseRepository.findByRegionAndThemesInAndIsPublicTrue(region, themes, pageable);
		} else {
			// 테마가 없을 경우: 스마트 검색 전략 적용
			coursePage = searchCoursesByOptimizedRegion(region, pageable);
		}

		// 4. N+1 쿼리 문제 해결: 모든 코스의 장소들을 한 번에 조회
		List<Long> courseIds = coursePage.getContent().stream()
			.map(Course::getId)
			.toList();

		// 4-1. 모든 코스의 장소 순서를 한 번에 조회
		List<PlacesOrder> allPlaceOrders = placesOrderRepository.findByCourseIdInOrderByCourseIdAscVisitOrderAsc(
			courseIds);

		// 4-2. 코스 ID별로 장소들 그룹핑
		Map<Long, List<PlacesOrder>> placeOrdersByCourse = allPlaceOrders.stream()
			.collect(Collectors.groupingBy(PlacesOrder::getCourseId));

		// 4-3. [엔티티 -> 응답 dto 변환] (map 활용) + 장소 정보 포함
		List<CourseListResponseDto> dtoList = coursePage.stream()
			.map(course -> {
				// 해당 코스의 장소 순서 가져오기 (이미 조회된 데이터에서)
				List<PlacesOrder> placeOrders = placeOrdersByCourse.getOrDefault(course.getId(), new ArrayList<>());

				// placeId 리스트 추출
				List<String> placeIds = placeOrders.stream()
					.map(PlacesOrder::getPlaceId)
					.toList();

				// 장소 정보 조회 (목록에서는 위치정보 필요 없어서 null 처리)
				List<CoursePlaceInfo> places = placeService.getPlacesForCourseWithRoute(
					placeIds, null, null
				);

				// 매퍼로 DTO 변환
				return CourseMapper.toListWithPlaces(course, places);
			})
			.toList();

		// 5. PageImpl 로 Page 객체 생성
		Page<CourseListResponseDto> dtoPage = new PageImpl<>(dtoList, pageable, coursePage.getTotalElements());

		// 6. 커스텀 페이징 응답 dto 로 변환 후 반환
		return PagedResponse.from(dtoPage);
	}

	/**
	 * 성능 최적화된 지역 검색 전략을 사용하여 코스를 검색합니다.
	 * 한국 지역명 특성을 고려한 3단계 스마트 검색을 구현합니다.
	 *
	 * 검색 전략:
	 * 1. 정확한 지역명 매칭 (인덱스 활용, 최고 성능)
	 * 2. 지역명으로 시작하는 검색 (인덱스 활용 가능, 중간 성능)
	 * 3. 포함 검색 (전체 스캔, 가장 포괄적이지만 느림)
	 *
	 * @param region 검색할 지역명 (예: "강남", "서울" 등)
	 * @param pageable 페이징 정보
	 * @return 검색된 코스 페이지
	 * @example "강남" 검색 시: "강남" → "강남구", "강남동" → "서울특별시 강남구" 순으로 검색
	 */
	private Page<Course> searchCoursesByOptimizedRegion(String region, Pageable pageable) {
		if (region == null || region.trim().isEmpty()) {
			return courseRepository.findByRegionAndIsPublicTrue("", pageable);
		}

		String searchTerm = region.trim();

		// 1차: 정확한 지역명 매칭 시도 (인덱스 활용)
		// 예: "강남" → region = "강남"
		Page<Course> exactMatch = courseRepository.findByExactRegionAndIsPublicTrue(searchTerm, pageable);
		if (exactMatch.hasContent()) {
			return exactMatch;
		}

		// 2차: 지역명으로 시작하는 검색 (인덱스 활용 가능)
		// 예: "강남" → region LIKE "강남%" ("강남구", "강남동" 매칭)
		Page<Course> startsWithMatch = courseRepository.findByRegionStartsWithAndIsPublicTrue(searchTerm, pageable);
		if (startsWithMatch.hasContent()) {
			return startsWithMatch;
		}

		// 3차: 포함 검색 (기존 방식, 느리지만 가장 포괄적)
		// 예: "강남" → region LIKE "%강남%" ("서울특별시 강남구" 매칭)
		return courseRepository.findByRegionAndIsPublicTrue(searchTerm, pageable);
	}

	/**
	 * 코스의 상세 정보를 조회하고 조회수를 증가시킵니다.
	 * 사용자 위치 정보를 기반으로 루트를 추가로 제공합니다.
	 *
	 * @param courseId 조회할 코스 ID
	 * @param userLatitude 사용자 현재 위도 (루트 계산용, null 가능)
	 * @param userLongitude 사용자 현재 경도 (루트 계산용, null 가능)
	 * @return 코스 상세 정보 (장소 목록, 루트 정보 포함)
	 * @throws CustomException 코스를 찾을 수 없는 경우
	 */
	@Transactional
	public CourseDetailResponseDto getCourseDetail(
		Long courseId,
		Double userLatitude,
		Double userLongitude
	) {
		// 1. 코스 조회
		Course findCourse = courseRepository.findByIdWithThemes(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		// 2. 조회수 증가
		findCourse.incrementViewCount();

		// 3. 장소 조회
		List<PlacesOrder> placesOrders = placesOrderRepository.findByCourseIdOrderByVisitOrderAsc(courseId);

		List<String> placeIds = placesOrders.stream()
			.map(order -> order.getPlaceId())
			.collect(Collectors.toList());

		List<CoursePlaceInfo> placesForCourseWithRoute = placeService.getPlacesForCourseWithRoute(placeIds,
			userLatitude, userLongitude);

		// 4. 매퍼 사용하여 DTO 변환 후 반환
		return CourseMapper.toDetailDto(findCourse, placesForCourseWithRoute);
	}

	/**
	 * 기존 코스의 정보를 수정합니다.
	 * 코스 작성자만 수정할 수 있습니다.
	 *
	 * @param courseId 수정할 코스 ID
	 * @param requestDto 수정할 코스 정보 (제목, 설명, 테마, 지역, 공개 여부)
	 * @param userId 수정을 요청한 사용자 ID
	 * @return 수정된 코스 정보
	 * @throws CustomException 코스를 찾을 수 없거나 수정 권한이 없는 경우
	 */
	@Transactional
	public CourseUpdateResponseDto updateCourseInfo(
		Long courseId,
		CourseUpdateRequestDto requestDto,
		Long userId
	) {
		// 1. 수정할 코스 DB 에서 조회.
		Course findCourse = courseRepository.findByIdWithThemes(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		// 2. 사용자 권한 체크 - 본인 코스만 수정할 수 있게
		if (!findCourse.getUser().getId().equals(userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_COURSE_ACCESS);
		}

		// 3. 코스 업데이트
		Course updatedCourse = findCourse.updateCourseInfoFromRequest(
			requestDto.getTitle(),
			requestDto.getDescription(),
			requestDto.getThemes(),
			requestDto.getRegion(),
			requestDto.getIsPublic()
		);

		// 4. dto 반환하기[엔티티 -> 응답 dto 변환]
		return CourseMapper.toUpdateDto(updatedCourse);
	}

	/**
	 * 코스를 소프트 삭제합니다.
	 * 코스 작성자만 삭제할 수 있습니다.
	 *
	 * @param courseId 삭제할 코스 ID
	 * @param userId 삭제를 요청한 사용자 ID
	 * @throws CustomException 코스를 찾을 수 없거나 삭제 권한이 없는 경우
	 */
	@Transactional
	public void deleteCourseById(
		Long courseId,
		Long userId
	) {
		// 1. 코스 조회하기
		Course findCourse = courseRepository.findByIdWithThemes(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		// 2. 사용자 권한 체크 - 본인 코스만 삭제할 수 있게
		if (!findCourse.getUser().getId().equals(userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_COURSE_ACCESS);
		}

		// 3. 소프트 삭제
		findCourse.softDelete();
	}

	/**
	 * ID로 코스를 조회합니다.
	 * 다른 서비스에서 사용하는 내부 메서드입니다.
	 *
	 * @param id 코스 ID
	 * @return 조회된 코스 엔티티
	 * @throws CustomException 코스를 찾을 수 없는 경우
	 */
	public Course getCourseById(Long id) {
		return courseRepository.findByIdWithThemes(id)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
	}

	/**
	 * 북마크 수를 기반으로 이달의 인기 코스 목록을 조회합니다.
	 * 이달 내에 북마크된 수가 많은 코스 순으로 정렬하여 최신 인기 트렌드를 반영합니다.
	 * 사용자들이 실제로 저장하고 싶어하는 코스들을 우선적으로 보여줍니다.
	 *
	 * @param filterDto 검색 필터 (지역, 테마 조건)
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 북마크 수 순으로 정렬된 인기 코스 목록
	 */
	@Transactional(readOnly = true)
	public PagedResponse<CourseListResponseDto> getPopularCourseList(
		CourseListFilterDto filterDto,
		Pageable pageable
	) {
		// 1. 데이터 준비
		String region = filterDto.getRegion();
		List<CourseTheme> themes = filterDto.getThemes();

		// 2. 이달 기간 설정
		LocalDateTime startOfMonth = LocalDateTime.now()
			.withDayOfMonth(1)
			.withHour(0)
			.withMinute(0)
			.withSecond(0)
			.withNano(0);
		LocalDateTime now = LocalDateTime.now();

		// 3. 조건에 따라 인기 코스 조회 (이달 북마크 수 기준)
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

		// 4. [엔티티 -> 응답 dto 변환] - 코스별 장소 조회 및 매핑
		List<CourseListResponseDto> dtoList = coursePage.stream()
			.map(course -> {
				List<PlacesOrder> placeOrders = placesOrderRepository.findByCourseIdOrderByVisitOrderAsc(
					course.getId());

				List<String> placeIds = placeOrders.stream()
					.map(PlacesOrder::getPlaceId)
					.toList();

				List<CoursePlaceInfo> places = placeService.getPlacesForCourseWithRoute(
					placeIds, null, null
				);

				return CourseMapper.toListWithPlaces(course, places);
			})
			.toList();

		// 5. PageImpl로 Page 객체 생성
		Page<CourseListResponseDto> dtoPage = new PageImpl<>(dtoList, pageable, coursePage.getTotalElements());

		// 6. 커스텀 페이지네이션 응답 DTO로 변환 후 반환
		return PagedResponse.from(dtoPage);
	}

	/**
	 * 내가 만든 코스 목록 조회
	 *
	 * 사용자가 직접 생성한 코스 목록을 페이징하여 조회합니다.
	 * 각 코스에 포함된 장소 정보도 함께 반환합니다.
	 *
	 * @param userId 조회할 사용자 ID
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 내가 생성한 코스 목록과 페이지네이션 정보
	 */
	@Transactional(readOnly = true)
	public PagedResponse<CourseListResponseDto> getCoursesByUser(Long userId, Pageable pageable) {
		// 1. 내가 만든 코스 목록 페이징 조회
		Page<Course> coursePage = courseRepository.findByUserIdAndIsDeletedFalse(userId, pageable);

		// 2. 코스 ID 목록 추출
		List<Long> courseIds = coursePage.getContent().stream()
			.map(Course::getId)
			.toList();

		// 3. 장소 순서 정보 일괄 조회
		List<PlacesOrder> allPlaceOrders = placesOrderRepository.findByCourseIdInOrderByCourseIdAscVisitOrderAsc(
			courseIds);

		// 4. courseId → placeOrders 그룹핑
		Map<Long, List<PlacesOrder>> placeOrdersByCourse = allPlaceOrders.stream()
			.collect(Collectors.groupingBy(PlacesOrder::getCourseId));

		// 5. 각 Course → CourseListResponseDto로 변환 (장소 포함)
		List<CourseListResponseDto> dtoList = coursePage.getContent().stream()
			.map(course -> {
				List<PlacesOrder> orders = placeOrdersByCourse.getOrDefault(course.getId(), new ArrayList<>());
				List<String> placeIds = orders.stream().map(PlacesOrder::getPlaceId).toList();
				List<CoursePlaceInfo> places = placeService.getPlacesForCourseWithRoute(placeIds, null, null);

				return CourseMapper.toListWithPlaces(course, places);
			})
			.toList();

		// 6. 최종 페이지 생성 및 반환
		Page<CourseListResponseDto> dtoPage = new PageImpl<>(dtoList, pageable, coursePage.getTotalElements());
		return PagedResponse.from(dtoPage);
	}

}
