package com.example.wherewego.domain.courses.service;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.wherewego.domain.courses.dto.request.CourseListFilterDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.PlacesOrder;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.courses.repository.PlaceRepository;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.response.PagedResponse;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {
	@Mock
	private CourseRepository courseRepository;

	@Mock
	private UserRepository userRepository;

	@Mock
	private PlaceService placeService;

	@Mock
	private PlaceRepository placeRepository;

	@InjectMocks
	private CourseService courseService;

	@BeforeEach
	void setUp() {
		courseService = new CourseService(
			courseRepository,
			userRepository,
			placeService,
			placeRepository
		);
	}

	@Test
	@DisplayName("코스 목록 조회")
	void getCourseList() {
		// given
		CourseListFilterDto filterDto = new CourseListFilterDto("부산", null);
		Pageable pageable = PageRequest.of(0, 10);

		// when
		PagedResponse<CourseListResponseDto> result = courseService.getCourseList(filterDto, pageable);

		// then
		assertNotNull(result); // 또는 result.getContent().size() 등으로 검사 가능
	}

	@Test
	@DisplayName("코스 상세 조회")
	void getCourseDetail() {
		// given
		Long courseId = 1L;
		User user = User.builder().id(1L).build();
		PlacesOrder placesOrder = new PlacesOrder(1L, courseId, "placeId", 1, LocalDateTime.now());
		List<PlacesOrder> placesOrderList = List.of(placesOrder);

		Course course = Course.builder()
			.id(courseId)
			.title("가을 여행")
			.region("서울")
			.isPublic(true)
			.user(user)
			.build();

		// Mock stubbing - 정확한 courseId 값 사용
		when(courseRepository.findByIdWithThemes(1L)).thenReturn(Optional.of(course));
		when(placeRepository.findByCourseIdOrderByVisitOrderAsc(courseId)).thenReturn(placesOrderList);

		// when
		CourseDetailResponseDto detail = courseService.getCourseDetail(courseId, 1.1, 1.1);

		// then
		verify(placeRepository).findByCourseIdOrderByVisitOrderAsc(1L);
		assertThat(detail.getTitle()).isEqualTo("가을 여행");
		assertThat(detail.getRegion()).isEqualTo("서울");
		assertThat(detail.getIsPublic()).isEqualTo(true);
	}

	@Test
	@DisplayName("코스 삭제")
	void deleteCourse() {
		// given
		Course course = Course.builder()
			.title("삭제할 코스")
			.region("강원")
			.isPublic(true)
			.build();
		Course saved = courseRepository.save(course);

		// when
		courseService.deleteCourseById(saved.getId(), saved.getUser().getId());

		// then
		Optional<Course> deleted = courseRepository.findById(saved.getId());
		assertThat(deleted).isEmpty();
	}
}
