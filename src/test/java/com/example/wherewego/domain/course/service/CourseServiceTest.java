package com.example.wherewego.domain.course.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.wherewego.domain.auth.enums.Provider;
import com.example.wherewego.domain.common.enums.CourseTheme;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.PlacesOrder;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.courses.repository.PlacesOrderRepository;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

/**
 * CourseService 단위 테스트
 *
 * 간소화된 버전 - 핵심 기능만 테스트
 */
@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

	@Mock
	private CourseRepository courseRepository;

	@Mock
	private UserService userService;

	@Mock
	private PlaceService placeService;

	@Mock
	private PlacesOrderRepository placesOrderRepository;

	@InjectMocks
	private CourseService courseService;

	private User testUser;
	private Course testCourse;
	private List<PlacesOrder> testPlaces;

	@BeforeEach
	void setUp() {
		// 테스트용 사용자 생성
		testUser = User.builder()
			.id(1L)
			.email("test@example.com")
			.nickname("테스터")
			.password("encodedPassword")
			.provider(Provider.LOCAL)
			.build();

		// 테스트용 코스 생성
		testCourse = Course.builder()
			.id(1L)
			.title("서울 가을 여행")
			.region("서울")
			.description("단풍 명소 투어")
			.isPublic(true)
			.user(testUser)
			.themes(List.of(CourseTheme.HEALING))
			.likeCount(10)
			.viewCount(100)
			.bookmarkCount(5)
			.commentCount(3)
			.build();

		// 테스트용 장소 순서 생성
		testPlaces = List.of(
			new PlacesOrder(1L, 1L, "place1", 1, LocalDateTime.now()),
			new PlacesOrder(2L, 1L, "place2", 2, LocalDateTime.now())
		);
	}

	@Test
	@DisplayName("지역 필터로 코스 목록 조회 성공")
	void shouldGetCourseListWithRegionFilter() {
		// given
		CourseListFilterDto filterDto = new CourseListFilterDto("서울", null);
		Pageable pageable = PageRequest.of(0, 10);
		Page<Course> coursePage = new PageImpl<>(List.of(testCourse), pageable, 1);

		when(courseRepository.findByExactRegionAndIsPublicTrue("서울", pageable))
			.thenReturn(coursePage);
		when(placesOrderRepository.findByCourseIdInOrderByCourseIdAscVisitOrderAsc(List.of(1L)))
			.thenReturn(testPlaces);

		// when
		PagedResponse<?> result = courseService.getCourseList(filterDto, pageable);

		// then
		assertThat(result).isNotNull();
		assertThat(result.content()).hasSize(1);
		verify(courseRepository).findByExactRegionAndIsPublicTrue("서울", pageable);
	}

	@Test
	@DisplayName("테마 필터로 코스 목록 조회 성공")
	void shouldGetCourseListWithThemeFilter() {
		// given
		CourseListFilterDto filterDto = new CourseListFilterDto("", List.of(CourseTheme.HEALING));
		Pageable pageable = PageRequest.of(0, 10);
		Page<Course> coursePage = new PageImpl<>(List.of(testCourse), pageable, 1);

		// 테마 필터링이 있는 경우의 Repository 메서드 모킹
		when(courseRepository.findByRegionAndThemesInAndIsPublicTrue("", List.of(CourseTheme.HEALING), pageable))
			.thenReturn(coursePage);
		when(placesOrderRepository.findByCourseIdInOrderByCourseIdAscVisitOrderAsc(List.of(1L)))
			.thenReturn(testPlaces);

		// when
		PagedResponse<?> result = courseService.getCourseList(filterDto, pageable);

		// then
		assertThat(result).isNotNull();
		assertThat(result.content()).hasSize(1);
	}

	@Test
	@DisplayName("코스 상세 조회 성공")
	void shouldGetCourseDetail() {
		// given
		Long courseId = 1L;
		double userLat = 37.5665;
		double userLng = 126.9780;

		when(courseRepository.findByIdWithThemes(courseId)).thenReturn(Optional.of(testCourse));
		when(placesOrderRepository.findByCourseIdOrderByVisitOrderAsc(courseId)).thenReturn(testPlaces);

		// when
		CourseDetailResponseDto result = courseService.getCourseDetail(courseId, userLat, userLng);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getTitle()).isEqualTo("서울 가을 여행");
		assertThat(result.getRegion()).isEqualTo("서울");
		assertThat(result.getIsPublic()).isTrue();
		verify(courseRepository).findByIdWithThemes(courseId);
		verify(placesOrderRepository).findByCourseIdOrderByVisitOrderAsc(courseId);
	}

	@Test
	@DisplayName("존재하지 않는 코스 조회 시 예외 발생")
	void shouldThrowExceptionWhenCourseNotFound() {
		// given
		Long nonExistentCourseId = 999L;
		when(courseRepository.findByIdWithThemes(nonExistentCourseId))
			.thenReturn(Optional.empty());

		// when & then
		assertThatThrownBy(() -> courseService.getCourseDetail(nonExistentCourseId, 37.5665, 126.9780))
			.isInstanceOf(CustomException.class)
			.hasMessage(ErrorCode.COURSE_NOT_FOUND.getMessage());

		verify(courseRepository).findByIdWithThemes(nonExistentCourseId);
		verify(placesOrderRepository, never()).findByCourseIdOrderByVisitOrderAsc(any());
	}

	// 코스 삭제 관련 테스트들은 현재 구현되지 않은 기능이므로 제거
}