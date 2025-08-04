package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseLikeResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseLike;
import com.example.wherewego.domain.courses.repository.CourseLikeRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

/**
 * 코스 좋아요 관리 서비스
 * 사용자의 코스 좋아요 추가 및 삭제 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class CourseLikeService {

	private final CourseLikeRepository likeRepository;
	private final UserService userService;
	private final CourseService courseService;

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
		// 반환
		return new CourseLikeResponseDto(
<<<<<<< HEAD
			savedLike.getId(),
			savedLike.getUser().getId(),
			savedLike.getCourse().getId()
=======
			savedCourseLike.getId(),
			savedCourseLike.getUser().getId(),
			savedCourseLike.getCourse().getId()
>>>>>>> 8b29307797060e5c739c329fd4cbe5a57ad50d5d
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
	public void deleteCourseLike(Long userId, Long courseId) {
		// 좋아요 존재 검사
<<<<<<< HEAD
		Like like = likeRepository.findByUserIdAndCourseId(userId, courseId)
=======
		CourseLike courseLike = likeRepository.findByUserIdAndCourseId(userId, courseId)
>>>>>>> 8b29307797060e5c739c329fd4cbe5a57ad50d5d
			.orElseThrow(() -> new CustomException(ErrorCode.LIKE_NOT_FOUND));
		// hard delete
		likeRepository.delete(courseLike);
		// 코스 테이블의 좋아요 수(like_count) -1
		Course course = courseService.getCourseById(courseId);
		course.decrementLikeCount();
	}

}