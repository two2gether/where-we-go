package com.example.wherewego.domain.courses.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.CourseBookmark;

@Repository
public interface CourseBookmarkRepository extends JpaRepository<CourseBookmark, Long> {
	boolean existsByUserIdAndCourseId(Long userId, Long courseId);

	Optional<CourseBookmark> findByUserIdAndCourseId(Long userId, Long courseId);

	// 북마크 목록 페이징 조회 (bookmarkCreatedAt 내림차순 정렬)
	Page<CourseBookmark> findByUserId(Long userId, Pageable pageable);

	/**
	 * N+1 문제 방지를 위한 fetch join 쿼리
	 * CourseBookmark -> Course -> User를 한 번에 조회
	 * isMine 필드 계산을 위한 Course.user 정보가 필요할 때 사용
	 */
	@Query("SELECT cb FROM CourseBookmark cb " +
			"JOIN FETCH cb.course c " +
			"JOIN FETCH c.user u " +
			"WHERE cb.user.id = :userId " +
			"ORDER BY cb.createdAt DESC")
	Page<CourseBookmark> findByUserIdWithCourseAndUser(@Param("userId") Long userId, Pageable pageable);
}