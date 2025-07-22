package com.example.wherewego.domain.courses.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.wherewego.common.enums.CourseTheme;
import com.example.wherewego.domain.courses.entity.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

	Page<Course> findByRegionAndThemesInAndIsPublicTrue(String region, List<CourseTheme> themes, Pageable pageable);

	Page<Course> findByRegionAndIsPublicTrue(String region, Pageable pageable);
}
