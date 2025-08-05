package com.example.wherewego.domain.courses.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.CourseLike;

@Repository
public interface CourseLikeRepository extends JpaRepository<CourseLike, Long> {
	boolean existsByUserIdAndCourseId(Long userId, Long courseId);

	Optional<CourseLike> findByUserIdAndCourseId(Long userId, Long courseId);

	Page<CourseLike> findAllByUserId(Long userId, Pageable pageable);
}
