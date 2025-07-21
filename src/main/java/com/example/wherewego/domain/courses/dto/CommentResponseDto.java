package com.example.wherewego.domain.courses.dto;

import com.example.wherewego.domain.courses.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentResponseDto {

    private Long commentId;
    private Long courseId;
    private Long userId;
    private String nickname;
    private String content;
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
