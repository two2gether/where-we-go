package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.global.exception.CustomException;

/**
 * 코스 통계 관리 서비스
 * 엔티티에서 분리된 비즈니스 로직을 담당
 */
@Service
public class CourseStatisticsService {

	/**
	 * 평점 추가 시 통계 업데이트
	 *
	 * @param course 대상 코스
	 * @param rating 추가할 평점 (1-5)
	 */
	public void addRating(Course course, Double rating) {
		validateRating(rating);

		double newRatingSum = course.getRatingSum() + rating;
		int newRatingCount = course.getRatingCount() + 1;
		double newAverageRating = calculateAverageRating(newRatingSum, newRatingCount);

		// 엔티티는 단순 setter 역할만
		course.updateRatingStatistics(newRatingSum, newRatingCount, newAverageRating);
	}

	/**
	 * 평점 제거 시 통계 업데이트
	 *
	 * @param course 대상 코스
	 * @param rating 제거할 평점 (1-5)
	 */
	public void removeRating(Course course, Double rating) {
		validateRating(rating);

		if (course.getRatingCount() <= 0) {
			return; // 제거할 평점이 없음
		}

		double newRatingSum = Math.max(0, course.getRatingSum() - rating);
		int newRatingCount = Math.max(0, course.getRatingCount() - 1);
		double newAverageRating = calculateAverageRating(newRatingSum, newRatingCount);

		course.updateRatingStatistics(newRatingSum, newRatingCount, newAverageRating);
	}

	/**
	 * 평점 재계산 (데이터 정합성 복구용)
	 *
	 * @param course 대상 코스
	 * @param totalRatingSum 실제 평점 총합
	 * @param totalRatingCount 실제 평점 개수
	 */
	public void recalculateRating(Course course, Double totalRatingSum, Integer totalRatingCount) {
		double averageRating = calculateAverageRating(totalRatingSum, totalRatingCount);
		course.updateRatingStatistics(totalRatingSum, totalRatingCount, averageRating);
	}

	/**
	 * 일일 인기 점수 계산
	 * 좋아요, 조회수, 북마크, 댓글을 종합한 점수
	 *
	 * @param course 대상 코스
	 * @return 계산된 일일 점수
	 */
	public Integer calculateDailyScore(Course course) {
		// 가중치 적용한 점수 계산
		int likeWeight = 3;
		int viewWeight = 1;
		int bookmarkWeight = 2;
		int commentWeight = 2;

		return (course.getLikeCount() * likeWeight) +
			(course.getViewCount() * viewWeight) +
			(course.getBookmarkCount() * bookmarkWeight) +
			(course.getCommentCount() * commentWeight);
	}

	// === Private Helper Methods ===

	/**
	 * 평점 값의 유효성을 검증합니다.
	 *
	 * @param rating 평점 값 (1.0 ~ 5.0 범위)
	 * @throws CustomException 유효하지 않은 평점 값인 경우
	 */
	private void validateRating(Double rating) {
		if (rating == null || rating < 1.0 || rating > 5.0) {
			throw new CustomException(ErrorCode.INVALID_RATING_VALUE);
		}
	}

	/**
	 * 평균 평점을 계산합니다.
	 * 소수점 둘째 자리에서 반올림 처리합니다.
	 *
	 * @param ratingSum 평점 총합
	 * @param ratingCount 평점 개수
	 * @return 계산된 평균 평점 (소수점 첫째 자리까지)
	 */
	private double calculateAverageRating(double ratingSum, int ratingCount) {
		if (ratingCount <= 0) {
			return 0.0;
		}
		return Math.round((ratingSum / ratingCount) * 10.0) / 10.0; // 소수점 첫째자리까지
	}
}