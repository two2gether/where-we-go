package com.example.wherewego.domain.courses.repository;

import com.example.wherewego.domain.courses.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Long, Course> {

}
