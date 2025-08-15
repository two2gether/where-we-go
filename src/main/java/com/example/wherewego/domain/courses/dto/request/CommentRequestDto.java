package com.example.wherewego.domain.courses.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 댓글 수정 요청 DTO
 * 코스 댓글을 수정할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequestDto {

	/**
	 * 댓글 내용
	 */
	@NotBlank(message = "댓글 내용을 입력해주세요")
	private String content;

}