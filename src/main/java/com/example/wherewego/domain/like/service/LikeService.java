package com.example.wherewego.domain.like.service;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseRepository;
import com.example.wherewego.domain.like.dto.LikeResponseDto;
import com.example.wherewego.domain.like.entity.Like;
import com.example.wherewego.domain.like.repository.LikeRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserService userService;
    private final CourseRepository courseRepository; // TODO service로 변경

    @Transactional
    public LikeResponseDto create(Long userId, Long courseId) {
        User user = userService.getUserById(userId);
        // TODO 코스서비스의 findById 메서드로 변경
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        // 좋아요 중복 검사
        if(likeRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new CustomException(ErrorCode.LIKE_ALREADY_EXISTS);
        }
        // 코스 테이블의 좋아요 수(like_count) +1
        course.incrementLikeCount();
        // 레파지토리 저장
        Like like = new Like(user, course);
        Like savedLike = likeRepository.save(like);
        // 반환
        return new LikeResponseDto(savedLike.getId(), savedLike.getUser().getId(), savedLike.getCourse().getId());
    }

    @Transactional
    public void delete(Long userId, Long courseId) {
        // TODO 코스서비스의 findById 메서드로 변경
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        // 좋아요 존재 검사
        Like like = likeRepository.findByUserIdAndCourseId(userId, courseId).orElseThrow(() -> new CustomException(ErrorCode.LIKE_NOT_FOUND));
        // 인가 검사
        if(!userId.equals(like.getUser().getId())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_USER);
        }
        // 코스 테이블의 좋아요 수(like_count) -1
        course.decrementLikeCount();
        // hard delete
        likeRepository.delete(like);
    }

    // TODO 사용되지 않으면 삭제 예정
    public Like getLikeById(Long id) {
        return likeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.LIKE_NOT_FOUND));
    }
}
