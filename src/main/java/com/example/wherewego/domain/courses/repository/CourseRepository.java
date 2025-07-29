package com.example.wherewego.domain.courses.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.entity.Course;

import io.lettuce.core.dynamic.annotation.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {
	// Fetch Join - 테마 조건 있음
	// FIXME : DISTICT 제거
	@Query("""
		    SELECT DISTINCT c FROM Course c
		    LEFT JOIN FETCH c.themes t
		    WHERE c.region = :region
		      AND c.isPublic = true
			  AND c.isDeleted = false
		      AND t IN (:themes)
		""")
	List<Course> findByRegionAndThemesInAndIsPublicTrue(
		@Param("region") String region,
		@Param("themes") List<CourseTheme> themes
	);

	// Fetch Join - 테마 조건 없음
	// FIXME : DISTICT 제거
	@Query("""
		    SELECT DISTINCT c FROM Course c
		    LEFT JOIN FETCH c.themes
		    WHERE c.region = :region
			  AND c.isDeleted = false
		      AND c.isPublic = true
		""")
	List<Course> findByRegionAndIsPublicTrue(@Param("region") String region);

	@Query("""
		    SELECT c FROM Course c
		    LEFT JOIN FETCH c.themes
		    WHERE c.id = :courseId
		            AND c.isDeleted = false
		""")
	Optional<Course> findByIdWithThemes(@Param("courseId") Long courseId);

	@Query("""
		    SELECT c
		    FROM Course c
		    WHERE c.region = :region
		      AND c.isPublic = true
		      AND EXISTS (
		          SELECT 1
		          FROM CourseBookmark b
		          WHERE b.course = c
		            AND b.createdAt BETWEEN :startOfMonth AND :now
		      )
		    GROUP BY c.id
		    ORDER BY COUNT(CASE WHEN c.createdAt BETWEEN :startOfMonth AND :now THEN 1 END) DESC
		""")
	Page<Course> findPopularCoursesByRegionThisMonth(
		@Param("region") String region,
		@Param("startOfMonth") LocalDateTime startOfMonth,
		@Param("now") LocalDateTime now,
		Pageable pageable
	);

	@Query("""
		    SELECT c
		    FROM Course c
			JOIN CourseBookmark b ON b.course = c
			WHERE c.region = :region
			  AND c.isPublic = true
			  AND :themes MEMBER OF c.themes
			  AND b.createdAt BETWEEN :startOfMonth AND :now
			GROUP BY c.id
			ORDER BY COUNT(b.id) DESC
		""")
	Page<Course> findPopularCoursesByRegionAndThemesThisMonth(
		@Param("region") String region,
		@Param("themes") List<CourseTheme> themes,
		@Param("startOfMonth") LocalDateTime startOfMonth,
		@Param("now") LocalDateTime now,
		Pageable pageable
	);
}
