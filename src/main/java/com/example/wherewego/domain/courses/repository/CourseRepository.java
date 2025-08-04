package com.example.wherewego.domain.courses.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.wherewego.domain.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.entity.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
	// Fetch Join - 테마 조건 있음
	@Query("""
		    SELECT DISTINCT c FROM Course c
		    LEFT JOIN FETCH c.themes t
		    LEFT JOIN FETCH c.user
		    WHERE c.region LIKE CONCAT('%', :region, '%')
		      AND c.isPublic = true
			  AND c.isDeleted = false
		      AND t IN (:themes)
		""")
	Page<Course> findByRegionAndThemesInAndIsPublicTrue(
		@Param("region") String region,
		@Param("themes") List<CourseTheme> themes,
		Pageable pageable
	);

	// Fetch Join - 테마 조건 없음
	@Query("""
		    SELECT c FROM Course c
		    LEFT JOIN FETCH c.themes
		    LEFT JOIN FETCH c.user
		    WHERE c.region LIKE CONCAT('%', :region, '%')
			  AND c.isDeleted = false
		      AND c.isPublic = true
		""")
	Page<Course> findByRegionAndIsPublicTrue(@Param("region") String region,
		Pageable pageable);
	
	// 성능 최적화: 정확한 지역 매칭 (인덱스 활용 가능)
	@Query("""
		    SELECT c FROM Course c
		    LEFT JOIN FETCH c.themes
		    LEFT JOIN FETCH c.user
		    WHERE c.region = :region
			  AND c.isDeleted = false
		      AND c.isPublic = true
		""")
	Page<Course> findByExactRegionAndIsPublicTrue(@Param("region") String region,
		Pageable pageable);
		
	// 성능 최적화: 지역 시작 문자로 검색 (인덱스 활용 가능)
	@Query("""
		    SELECT c FROM Course c
		    LEFT JOIN FETCH c.themes
		    LEFT JOIN FETCH c.user
		    WHERE c.region LIKE CONCAT(:region, '%')
			  AND c.isDeleted = false
		      AND c.isPublic = true
		""")
	Page<Course> findByRegionStartsWithAndIsPublicTrue(@Param("region") String region,
		Pageable pageable);

	@Query("""
		    SELECT c FROM Course c
		    LEFT JOIN FETCH c.themes
		    LEFT JOIN FETCH c.user
		    WHERE c.id = :courseId
		            AND c.isDeleted = false
		""")
	Optional<Course> findByIdWithThemes(@Param("courseId") Long courseId);

	@Query("""
		    SELECT c
		    FROM Course c
		    LEFT JOIN FETCH c.themes
		    LEFT JOIN FETCH c.user
		    JOIN CourseBookmark b ON b.course = c
		    WHERE c.region LIKE CONCAT('%', :region, '%')
		      AND c.isPublic = true
		      AND c.isDeleted = false
		      AND b.createdAt BETWEEN :startOfMonth AND :now
		    GROUP BY c.id
		    ORDER BY COUNT(b.id) DESC
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
		    LEFT JOIN FETCH c.themes
		    LEFT JOIN FETCH c.user
		    JOIN CourseBookmark b ON b.course = c
		    WHERE c.region LIKE CONCAT('%', :region, '%')
		      AND c.isPublic = true
		      AND c.isDeleted = false
		      AND EXISTS (SELECT t3 FROM c.themes t3 WHERE t3 IN (:themes))
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

<<<<<<< HEAD
	// 내가 만든 코스 목록 조회
	Page<Course> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
=======
>>>>>>> 8b29307797060e5c739c329fd4cbe5a57ad50d5d
}
