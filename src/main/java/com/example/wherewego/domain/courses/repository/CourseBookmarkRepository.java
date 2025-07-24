package com.example.wherewego.domain.courses.repository;

import com.example.wherewego.domain.courses.entity.CourseBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseBookmarkRepository extends JpaRepository<CourseBookmark, Long> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    Optional<CourseBookmark> findByUserIdAndCourseId(Long userId, Long courseId);
}