package com.example.wherewego.domain.courses.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.entity.Course;

import io.lettuce.core.dynamic.annotation.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {
	// Fetch Join - 테마 조건 있음
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
			LEFT JOIN c.bookmarks b
			WHERE c.region = :region
			  AND (:themes IS NULL OR EXISTS (
				SELECT t FROM Course c2 JOIN c2.themes t
				WHERE c2.id = c.id AND t IN :themes
			  ))
			  AND c.isPublic = true
			  AND (b.createdAt >= :startOfMonth OR b.id IS NULL)
			GROUP BY c.id
			ORDER BY COUNT(b.id) DESC
		""")
	List<Course> findPopularCoursesByMonth(
		@Param("region") String region,
		@Param("themes") List<CourseTheme> themes,
		@Param("startOfMonth") LocalDateTime startOfMonth
	);
}
