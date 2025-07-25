package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseLikeResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.Like;
import com.example.wherewego.domain.courses.repository.CourseLikeRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseLikeService {

	private final CourseLikeRepository likeRepository;
	private final UserService userService;
	private final CourseService courseService;

	@Transactional
	public CourseLikeResponseDto courseLikeCeate(Long userId, Long courseId) {
		User user = userService.getUserById(userId);
		Course course = courseService.getCourseById(courseId);
		// 좋아요 중복 검사
		if(likeRepository.existsByUserIdAndCourseId(userId, courseId)) {
			throw new CustomException(ErrorCode.LIKE_ALREADY_EXISTS);
		}
		// 레파지토리 저장
		Like like = new Like(user, course);
		Like savedLike = likeRepository.save(like);
		// 코스 테이블의 좋아요 수(like_count) +1
		course.incrementLikeCount();
		// 반환
		return new CourseLikeResponseDto(
				savedLike.getId(),
				savedLike.getUser().getId(),
				savedLike.getCourse().getId()
		);
	}

	@Transactional
	public void courseLikeDelete(Long userId, Long courseId) {
		// 좋아요 존재 검사
		Like like = likeRepository.findByUserIdAndCourseId(userId, courseId)
				.orElseThrow(() -> new CustomException(ErrorCode.LIKE_NOT_FOUND));
		// hard delete
		likeRepository.delete(like);
		// 코스 테이블의 좋아요 수(like_count) -1
		Course course = courseService.getCourseById(courseId);
		course.decrementLikeCount();
	}

}