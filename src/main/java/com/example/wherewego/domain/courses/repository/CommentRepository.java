package com.example.wherewego.domain.courses.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

	List<Comment> findByCourseId(Long courseId);

	Optional<Comment> findByIdAndUserId(Long commentId, Long userId);

	//특정 코스에 대한 댓글 목록 최신순 조회
	@Query("SELECT c FROM Comment c WHERE c.course.id = :courseId ORDER BY c.createdAt DESC")
	Page<Comment> findAllByCourseIdOrderByCreatedAtDesc(@Param("courseId") Long courseId, Pageable pageable);

	// 로그인한 사용자가 쓴 댓글을 최신순으로 페이징 조회
	Page<Comment> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

	boolean existsByIdAndUserId(Long commentId, Long userId);

}
