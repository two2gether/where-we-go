package com.example.wherewego.domain.like.repository;

import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.like.entity.Like;
import com.example.wherewego.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    Optional<Like> findByUserIdAndCourseId(Long userId, Long courseId);
}
