package com.example.wherewego.domain.courses.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.CourseLike;

@Repository
public interface CourseLikeRepository extends JpaRepository<CourseLike, Long> {
	boolean existsByUserIdAndCourseId(Long userId, Long courseId);

	Optional<CourseLike> findByUserIdAndCourseId(Long userId, Long courseId);

	@EntityGraph(attributePaths = {"course"})
	Page<CourseLike> findAllByUserId(Long userId, Pageable pageable);

	@Modifying
	@Query(value = """
		INSERT INTO course_likes (user_id, course_id, active, is_deleted, created_at, updated_at)
		VALUES (:userId, :courseId, 1, 0, NOW(), NOW())
		ON DUPLICATE KEY UPDATE
		    active = IF(active = 0, 1, active),
		    updated_at = IF(active = 0, NOW(), updated_at)
		""", nativeQuery = true)
	int upsertActive(@Param("userId") Long userId, @Param("courseId") Long courseId);

	@Modifying
	@Query("delete from CourseLike cl where cl.user.id = :userId and cl.course.id = :courseId")
	int deleteByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);

	@Query(value = """
		SELECT id
		FROM course_likes
		WHERE user_id = :userId
		  AND course_id = :courseId
		  AND is_deleted = 0
		""", nativeQuery = true)
	Long findActiveId(@Param("userId") Long userId, @Param("courseId") Long courseId);

	boolean existsByUserIdAndCourseIdAndActiveTrue(Long userId, Long courseId);
}
