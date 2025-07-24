package com.example.wherewego.domain.courses.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.Query;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.entity.Course;

import io.lettuce.core.dynamic.annotation.Param;
=======
import org.springframework.stereotype.Repository;
>>>>>>> dev

@Repository
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
}
