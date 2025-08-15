package com.example.wherewego.domain.courses.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 댓글 생성 요청 DTO
 * 코스 댓글을 생성할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreateRequestDto {
	@NotNull(message = "courseId는 필수입니다.")
	private Long courseId;

	@NotBlank(message = "댓글 내용을 입력해주세요")
	private String content;
}