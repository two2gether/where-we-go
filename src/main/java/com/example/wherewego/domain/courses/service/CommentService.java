package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.CommentRequestDto;
import com.example.wherewego.domain.courses.dto.CommentResponseDto;
import com.example.wherewego.domain.courses.entity.Comment;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.repository.CommentRepository;
import com.example.wherewego.domain.courses.repository.CourseRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

	private final CommentRepository commentRepository;
	private final UserRepository userRepository;
	private final CourseRepository courseRepository;

	// 코스 댓글 생성
	public CommentResponseDto createComment(Long courseId, Long userId, CommentRequestDto requestDto) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		Course course = courseRepository.findById(courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

		Comment comment = Comment.builder()
			.content(requestDto.getContent())
			.user(user)
			.course(course)
			.build();

		commentRepository.save(comment);

		return toDto(comment);
	}

	private CommentResponseDto toDto(Comment comment) {
		return CommentResponseDto.of(comment);
	}

}
