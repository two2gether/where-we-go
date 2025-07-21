package com.example.wherewego.domain.courses.repository;

import com.example.wherewego.domain.courses.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByCourseId(Long courseId);

    Optional<Comment> findByIdAndUserId(Long commentId, Long userId);

    @Query("SELECT c FROM Comment c WHERE c.course.id = :courseId ORDER BY c.createdAt DESC")
    List<Comment> findAllByCourseIdOrderByCreatedAtDesc(@Param("courseId") Long courseId);

    boolean existsByIdAndUserId(Long commentId, Long userId);

}
