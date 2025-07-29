package com.example.wherewego.domain.courses.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.CourseBookmark;

@Repository
public interface CourseBookmarkRepository extends JpaRepository<CourseBookmark, Long> {
	boolean existsByUserIdAndCourseId(Long userId, Long courseId);

	Optional<CourseBookmark> findByUserIdAndCourseId(Long userId, Long courseId);

	// 북마크 목록 페이징 조회 (bookmarkCreatedAt 내림차순 정렬)
	Page<CourseBookmark> findByUserId(Long userId, Pageable pageable);
}