package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CourseRatingRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseRatingResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseRating;
import com.example.wherewego.domain.courses.repository.CourseRatingRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

/**
 * 코스 평점 관리 서비스
 * 평점 등록, 삭제 및 코스 통계 업데이트를 담당
 */
@Service
@RequiredArgsConstructor
public class CourseRatingService {

	private final CourseRatingRepository ratingRepository;
	private final UserService userService;
	private final CourseService courseService;
	private final CourseStatisticsService statisticsService;

	/**
	 * 코스 평점 등록
	 *
	 * @param userId 사용자 ID
	 * @param courseId 코스 ID
	 * @param request 평점 등록 요청 데이터
	 * @return 등록된 평점 정보
	 * @throws CustomException 중복 평점 등록 시 예외 발생
	 */
	@Transactional
	public CourseRatingResponseDto createCourseRating(Long userId, Long courseId, CourseRatingRequestDto request) {
		validateRatingInput(userId, courseId, request);

		Course course = courseService.getCourseById(courseId);
		User user = userService.getUserById(userId);

		validateDuplicateRating(userId, courseId);

		CourseRating courseRating = createAndSaveRating(user, course, request.getRating());
		updateCourseRatingStatistics(course, request.getRating());

		return buildRatingResponse(courseRating);
	}

	/**
	 * 코스 평점 삭제
	 *
	 * @param userId 사용자 ID
	 * @param courseId 코스 ID
	 * @throws CustomException 평점이 존재하지 않을 시 예외 발생
	 */
	@Transactional
	public void deleteCourseRating(Long userId, Long courseId) {
		validateRatingInput(userId, courseId, null);

		CourseRating courseRating = findExistingRating(userId, courseId);
		Course course = courseService.getCourseById(courseId);

		updateCourseRatingStatisticsOnDelete(course, courseRating.getRating());
		ratingRepository.delete(courseRating);
	}

	// === Private Helper Methods ===

	/**
	 * 평점 입력 데이터 유효성 검증
	 *
	 * @param userId 사용자 ID
	 * @param courseId 코스 ID
	 * @param request 평점 요청 데이터 (null 허용)
	 * @throws CustomException 유효하지 않은 입력 데이터인 경우
	 */
	private void validateRatingInput(Long userId, Long courseId, CourseRatingRequestDto request) {
		if (userId == null) {
			throw new CustomException(ErrorCode.MISSING_USER_ID);
		}
		if (courseId == null) {
			throw new CustomException(ErrorCode.MISSING_COURSE_ID);
		}
		if (request != null && (request.getRating() < 1 || request.getRating() > 5)) {
			throw new CustomException(ErrorCode.INVALID_RATING_VALUE);
		}
	}

	/**
	 * 중복 평점 등록 여부 검증
	 *
	 * @param userId 사용자 ID
	 * @param courseId 코스 ID
	 * @throws CustomException 이미 평점이 등록된 경우
	 */
	private void validateDuplicateRating(Long userId, Long courseId) {
		if (ratingRepository.existsByUserIdAndCourseId(userId, courseId)) {
			throw new CustomException(ErrorCode.RATING_ALREADY_EXISTS);
		}
	}

	/**
	 * 새로운 평점 엔티티를 생성하고 저장합니다.
	 *
	 * @param user 사용자 엔티티
	 * @param course 코스 엔티티
	 * @param ratingValue 평점 값 (1-5)
	 * @return 저장된 평점 엔티티
	 */
	private CourseRating createAndSaveRating(User user, Course course, int ratingValue) {
		CourseRating courseRating = new CourseRating(user, course, ratingValue);
		return ratingRepository.save(courseRating);
	}

	/**
	 * 평점 추가 시 코스 통계를 업데이트 합니다.
	 *
	 * @param course 대상 코스
	 * @param ratingValue 추가할 평점 값
	 */
	private void updateCourseRatingStatistics(Course course, int ratingValue) {
		statisticsService.addRating(course, (double)ratingValue);
	}

	/**
	 * 평점 삭제 시 코스 통계를 업데이트 합니다.
	 *
	 * @param course 대상 코스
	 * @param ratingValue 삭제할 평점 값
	 */
	private void updateCourseRatingStatisticsOnDelete(Course course, int ratingValue) {
		statisticsService.removeRating(course, (double)ratingValue);
	}

	/**
	 * 기존 평점을 조회합니다.
	 *
	 * @param userId 사용자 ID
	 * @param courseId 코스 ID
	 * @return 조회된 평점 엔티티
	 * @throws CustomException 평점을 찾을 수 없는 경우
	 */
	private CourseRating findExistingRating(Long userId, Long courseId) {
		return ratingRepository.findByUserIdAndCourseId(userId, courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.RATING_NOT_FOUND));
	}

	/**
	 * 평점 엔티티를 응답 DTO로 변환합니다.
	 *
	 * @param courseRating 평점 엔티티
	 * @return 평점 응답 DTO
	 */
	private CourseRatingResponseDto buildRatingResponse(CourseRating courseRating) {
		return new CourseRatingResponseDto(
			courseRating.getId(),
			courseRating.getUser().getId(),
			courseRating.getCourse().getId(),
			courseRating.getRating()
		);
	}

}