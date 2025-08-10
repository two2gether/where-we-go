package com.example.wherewego.domain.courses.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseLikeListResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseLikeResponseDto;
import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseLike;
import com.example.wherewego.domain.courses.entity.PlacesOrder;
import com.example.wherewego.domain.courses.mapper.CourseMapper;
import com.example.wherewego.domain.courses.repository.CourseLikeRepository;
import com.example.wherewego.domain.courses.repository.PlacesOrderRepository;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.courses.service.NotificationService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 코스 좋아요 관리 서비스
 * 사용자의 코스 좋아요 추가 및 삭제 기능을 제공합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseLikeService {

	private final CourseLikeRepository likeRepository;
	private final UserService userService;
	private final CourseService courseService;
	private final PlacesOrderRepository placesOrderRepository;
	private final PlaceService placeService;
	private final NotificationService notificationService;

	/**
	 * 코스에 좋아요를 추가합니다.
	 * 중복 좋아요를 방지하고 코스의 좋아요 수를 증가시킵니다.
	 *
	 * @param userId 좋아요를 추가할 사용자 ID
	 * @param courseId 좋아요를 추가할 코스 ID
	 * @return 생성된 좋아요 정보
	 * @throws CustomException 코스/사용자를 찾을 수 없거나 이미 좋아요가 존재하는 경우
	 */
	@Transactional
	@CacheEvict(value = "course-like-list", key = "@cacheKeyUtil.generateCourseLikeListKey(#userId)")
	public CourseLikeResponseDto createCourseLike(Long userId, Long courseId) {
		User user = userService.getUserById(userId);
		Course course = courseService.getCourseById(courseId);
		// 좋아요 중복 검사
		if (likeRepository.existsByUserIdAndCourseId(userId, courseId)) {
			throw new CustomException(ErrorCode.LIKE_ALREADY_EXISTS);
		}
		// 레파지토리 저장
		CourseLike courseLike = new CourseLike(user, course);
		CourseLike savedCourseLike = likeRepository.save(courseLike);
		// 코스 테이블의 좋아요 수(like_count) +1
		course.incrementLikeCount();

		// 알림 생성
		notificationService.triggerLikeNotification(user, course);

		// 반환
		return new CourseLikeResponseDto(
			savedCourseLike.getId(),
			savedCourseLike.getUser().getId(),
			savedCourseLike.getCourse().getId()
		);
	}

	/**
	 * 코스에서 좋아요를 삭제합니다.
	 * 좋아요를 완전히 삭제하고 코스의 좋아요 수를 감소시킵니다.
	 *
	 * @param userId 좋아요를 삭제할 사용자 ID
	 * @param courseId 좋아요를 삭제할 코스 ID
	 * @throws CustomException 좋아요가 존재하지 않는 경우
	 */
	@Transactional
	@CacheEvict(value = "course-like-list", key = "@cacheKeyUtil.generateCourseLikeListKey(#userId)")
	public void deleteCourseLike(Long userId, Long courseId) {
		// 좋아요 존재 검사
		CourseLike courseLike = likeRepository.findByUserIdAndCourseId(userId, courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.LIKE_NOT_FOUND));
		// hard delete
		likeRepository.delete(courseLike);
		// 코스 테이블의 좋아요 수(like_count) -1
		Course course = courseService.getCourseById(courseId);
		course.decrementLikeCount();
	}

	/**
	 * 인증된 사용자의 ID를 기반으로 좋아요를 누른 코스 목록을 페이지네이션하여 조회합니다.
	 * 각 코스에 포함된 장소 정보도 함께 매핑하여 반환합니다.
	 *
	 * @param userId 인증된 사용자 ID
	 * @param page 요청한 페이지 번호
	 * @param size 페이지 당 항목 수
	 * @return 페이징된 좋아요 코스 목록 응답 DTO
	 */
	@Transactional(readOnly = true)
	@Cacheable(value = "course-like-list", key = "@cacheKeyUtil.generateCourseLikeListKey(#userId)")
	public PagedResponse<CourseLikeListResponseDto> getCourseLikeList(Long userId, int page, int size) {
		//Page<CourseLike> ->  List<CoureseLike> -> List<Dto>  -> PageResponse<Dto>
		// 해당 유저의 좋아요 목록 가져오기
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		Page<CourseLike> pagedLikeList = likeRepository.findAllByUserId(userId, pageable);

		if (pagedLikeList.isEmpty()) {
			return null;
		}

		//place가져오기
		List<Long> courseIds = pagedLikeList.getContent().stream()
			.map(CourseLike::getId)
			.toList();

		List<PlacesOrder> allPlaceOrders = placesOrderRepository.findByCourseIdInOrderByCourseIdAscVisitOrderAsc(
			courseIds);

		Map<Long, List<PlacesOrder>> mappedPlaceOrders = allPlaceOrders.stream()
			.collect(Collectors.groupingBy(PlacesOrder::getCourseId));

		List<CourseLikeListResponseDto> dtos = pagedLikeList.getContent().stream()
			.map(courseLike -> {
				Course course = courseLike.getCourse();
				List<PlacesOrder> orders = mappedPlaceOrders.getOrDefault(courseLike.getCourse().getId(),
					new ArrayList<>());
				List<String> placeIds = orders.stream().map(PlacesOrder::getPlaceId).toList();
				List<CoursePlaceInfo> places = placeService.getPlacesForCourseWithRoute(placeIds, null, null);
				return CourseMapper.toCourseLikeDto(course, courseLike, places);
			})
			.toList();

		return PagedResponse.from(new PageImpl<>(dtos, pageable, pagedLikeList.getTotalPages()));
	}
}