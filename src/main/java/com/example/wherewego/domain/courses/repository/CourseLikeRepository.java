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

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query(value = """
		  DELETE FROM course_likes
		   WHERE user_id = :userId AND course_id = :courseId
		""", nativeQuery = true)
	int deleteLike(@Param("userId") Long userId, @Param("courseId") Long courseId);

	@Modifying
	@Query(value = """
		INSERT IGNORE INTO course_likes (user_id, course_id, is_deleted, created_at, updated_at)
		VALUES (:userId, :courseId, 0, NOW(), NOW())
		""", nativeQuery = true)
	int insertIgnoreLike(@Param("userId") Long userId, @Param("courseId") Long courseId);

	@Query("""
		    select l.id from CourseLike l
		    where l.user.id = :userId and l.course.id = :courseId
		""")
	Long findId(@Param("userId") Long userId, @Param("courseId") Long courseId);

}
