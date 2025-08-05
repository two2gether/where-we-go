package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;

import com.example.wherewego.domain.courses.entity.Comment;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 댓글 응답 DTO
 * 코스 댓글 정보를 반환할 때 사용하는 응답 데이터 클래스입니다.
 */
@Getter
@AllArgsConstructor
public class CommentResponseDto {

	/**
	 * 댓글 고유 식별자
	 */
	private Long commentId;
	/**
	 * 댓글이 속한 코스 ID
	 */
	private Long courseId;
	/**
	 * 댓글 작성자 ID
	 */
	private Long userId;
	/**
	 * 댓글 작성자 닉네임
	 */
	private String nickname;
	/**
	 * 댓글 내용
	 */
	private String content;
	/**
	 * 댓글 작성 일시
	 */
	private LocalDateTime createdAt;

	public static CommentResponseDto of(Comment comment) {
		return new CommentResponseDto(
			comment.getId(),
			comment.getCourse().getId(),
			comment.getUser().getId(),
			comment.getUser().getNickname(),
			comment.getContent(),
			comment.getCreatedAt()
		);
	}
}
