package com.example.wherewego.domain.courses.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.CourseRating;

@Repository
public interface CourseRatingRepository extends JpaRepository<CourseRating, Long> {
	boolean existsByUserIdAndCourseId(Long userId, Long courseId);

	Optional<CourseRating> findByUserIdAndCourseId(Long userId, Long courseId);

	// 평점 계산 (JPQL) - null이면 0반환
	@Query("SELECT COALESCE(AVG(r.rating), 0) FROM CourseRating r WHERE r.course.id = :courseId")
	double findAverageByCourseId(@Param("courseId") Long courseId);
}
