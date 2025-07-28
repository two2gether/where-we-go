package com.example.wherewego.domain.courses.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.wherewego.domain.courses.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

	//특정 코스에 대한 댓글 목록 최신순 조회
	Page<Comment> findAllByCourseIdOrderByCreatedAtDesc(Long courseId, Pageable pageable);

	// 로그인한 사용자가 쓴 댓글을 최신순으로 페이징 조회
	Page<Comment> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
