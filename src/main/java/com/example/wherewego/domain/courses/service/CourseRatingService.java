package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.request.CourseRatingRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseRatingResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.Rating;
import com.example.wherewego.domain.courses.repository.CourseRatingRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseRatingService {

	private final CourseRatingRepository ratingRepository;
	private final UserService userService;
	private final CourseService courseService;

	@Transactional
	public CourseRatingResponseDto courseRatingCreate(Long userId, Long courseId, CourseRatingRequestDto request) {
		// 코스 존재 검사
		Course course = courseService.getCourseById(courseId);
		User user = userService.getUserById(userId);
		// 평점 중복 등록 검사
		if (ratingRepository.existsByUserIdAndCourseId(userId, courseId)) {
			throw new CustomException(ErrorCode.RATING_ALREADY_EXISTS);
		}
		// 저장
		Rating rating = new Rating(user, course, request.getRating());
		Rating savedRating = ratingRepository.save(rating);
		// Course 평균 평점 업데이트
		double newAvgRating = ratingRepository.findAverageByCourseId(courseId);
		course.updateAverageRating(newAvgRating);
		// 반환
		return new CourseRatingResponseDto(
			savedRating.getId(),
			savedRating.getUser().getId(),
			savedRating.getCourse().getId(),
			savedRating.getRating()
		);
	}

	@Transactional
	public void courseRatingDelete(Long userId, Long courseId) {
		// 평점 존재 검사
		Rating rating = ratingRepository.findByUserIdAndCourseId(userId, courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.RATING_NOT_FOUND));
		// hard delete
		ratingRepository.delete(rating);
		// Course 평균 평점 업데이트
		Course course = courseService.getCourseById(courseId);
		double newAvgRating = ratingRepository.findAverageByCourseId(courseId);
		course.updateAverageRating(newAvgRating);
	}

}
