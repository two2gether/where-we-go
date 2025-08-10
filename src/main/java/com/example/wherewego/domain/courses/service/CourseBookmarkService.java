package com.example.wherewego.domain.courses.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseBookmarkResponseDto;
import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.dto.response.UserCourseBookmarkListDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseBookmark;
import com.example.wherewego.domain.courses.entity.PlacesOrder;
import com.example.wherewego.domain.courses.mapper.CourseMapper;
import com.example.wherewego.domain.courses.repository.CourseBookmarkRepository;
import com.example.wherewego.domain.courses.repository.PlaceRepository;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;

/**
 * 코스 북마크 관리 서비스
 * 사용자의 코스 북마크 추가, 조회 및 삭제 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class CourseBookmarkService {

	private final CourseBookmarkRepository bookmarkRepository;
	private final CourseBookmarkRepository courseBookmarkRepository;
	private final CourseService courseService;
	private final UserService userService;
	private final PlaceService placeService;
	private final PlaceRepository placeRepository;

	/**
	 * 코스에 북마크를 추가합니다.
	 * 중복 북마크를 방지하고 코스의 북마크 수를 증가시킵니다.
	 *
	 * @param userId 북마크를 추가할 사용자 ID
	 * @param courseId 북마크를 추가할 코스 ID
	 * @return 생성된 북마크 정보
	 * @throws CustomException 코스/사용자를 찾을 수 없거나 이미 북마크가 존재하는 경우
	 */
	@Transactional
	public CourseBookmarkResponseDto createCourseBookmark(Long userId, Long courseId) {
		// 코스 존재 검사
		Course course = courseService.getCourseById(courseId);
		User user = userService.getUserById(userId);
		// 북마크 중복 등록 검사
		if (bookmarkRepository.existsByUserIdAndCourseId(userId, courseId)) {
			throw new CustomException(ErrorCode.BOOKMARK_ALREADY_EXISTS);
		}
		// 북마크 저장
		CourseBookmark bookmark = new CourseBookmark(user, course);
		CourseBookmark savedBookmark = bookmarkRepository.save(bookmark);
		// 북마크 수 +1
		course.incrementBookmarkCount();
		// 반환
		return new CourseBookmarkResponseDto(
			savedBookmark.getId(),
			savedBookmark.getUser().getId(),
			savedBookmark.getCourse().getId()
		);
	}

	/**
	 * 코스에서 북마크를 삭제합니다.
	 * 북마크를 완전히 삭제하고 코스의 북마크 수를 감소시킵니다.
	 *
	 * @param userId 북마크를 삭제할 사용자 ID
	 * @param courseId 북마크를 삭제할 코스 ID
	 * @throws CustomException 코스를 찾을 수 없거나 북마크가 존재하지 않는 경우
	 */
	@Transactional
	public void deleteCourseBookmark(Long userId, Long courseId) {
		// 코스 존재 검사
		Course course = courseService.getCourseById(courseId);
		// 북마크 존재 검사
		CourseBookmark bookmark = bookmarkRepository.findByUserIdAndCourseId(userId, courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));
		// 북마크 hard delete
		bookmarkRepository.delete(bookmark);
		// 북마크 수 -1
		course.decrementBookmarkCount();
	}

	/**
	 * 내가 북마크한 코스 목록 조회
	 *
	 * 사용자가 북마크한 코스 목록을 페이징하여 조회합니다.
	 * 각 코스에 포함된 장소 정보와 북마크한 시점을 함께 제공합니다.
	 *
	 * @param userId 사용자 ID
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @return 북마크한 코스 목록과 페이지네이션 정보
	 */
	@Transactional(readOnly = true)
	public PagedResponse<UserCourseBookmarkListDto> getUserCourseBookmarks(Long userId, Pageable pageable) {
		return getUserCourseBookmarks(userId, pageable, null);
	}

	/**
	 * 내가 북마크한 코스 목록 조회 (소유권 정보 포함)
	 *
	 * 사용자가 북마크한 코스 목록을 페이징하여 조회합니다.
	 * 각 코스에 포함된 장소 정보와 북마크한 시점, 코스 소유권 정보를 함께 제공합니다.
	 *
	 * @param userId 사용자 ID
	 * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬)
	 * @param currentUserId 현재 요청한 사용자 ID (소유권 비교용, null 가능)
	 * @return 북마크한 코스 목록과 페이지네이션 정보 (isMine 필드 포함)
	 */
	@Transactional(readOnly = true)
	public PagedResponse<UserCourseBookmarkListDto> getUserCourseBookmarks(Long userId, Pageable pageable, Long currentUserId) {
		// 1. 북마크된 CourseBookmark 엔티티 페이징 조회
		// currentUserId가 있으면 N+1 방지를 위해 fetch join 쿼리 사용
		Page<CourseBookmark> bookmarkPage = currentUserId != null 
			? courseBookmarkRepository.findByUserIdWithCourseAndUser(userId, pageable)
			: courseBookmarkRepository.findByUserId(userId, pageable);

		// 2. 북마크된 코스 ID 목록 추출
		List<Long> courseIds = bookmarkPage.getContent().stream()
			.map(bookmark -> bookmark.getCourse().getId())
			.toList();

		// 3. 한 번에 장소 순서 조회
		List<PlacesOrder> allPlaceOrders = placeRepository.findByCourseIdInOrderByCourseIdAscVisitOrderAsc(courseIds);

		// 4. CourseId 기준으로 그룹핑
		Map<Long, List<PlacesOrder>> placeOrdersByCourse = allPlaceOrders.stream()
			.collect(Collectors.groupingBy(PlacesOrder::getCourseId));

		// 5. 북마크 → DTO 변환 (장소 포함, 소유권 정보 포함)
		List<UserCourseBookmarkListDto> dtoList = bookmarkPage.getContent().stream()
			.map(bookmark -> {
				Course course = bookmark.getCourse();

				List<PlacesOrder> orders = placeOrdersByCourse.getOrDefault(course.getId(), new ArrayList<>());
				List<String> placeIds = orders.stream().map(PlacesOrder::getPlaceId).toList();
				List<CoursePlaceInfo> places = placeService.getPlacesForCourseWithRoute(placeIds, null, null);

				return CourseMapper.toBookmarkCourseDto(course, bookmark.getCreatedAt(), places, currentUserId);
			})
			.toList();

		// 6. Page 생성 및 반환
		Page<UserCourseBookmarkListDto> dtoPage = new PageImpl<>(dtoList, pageable, bookmarkPage.getTotalElements());
		return PagedResponse.from(dtoPage);
	}

}
