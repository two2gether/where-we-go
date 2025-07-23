package com.example.wherewego.domain.courses.service;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseBookmarkResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseBookmark;
import com.example.wherewego.domain.courses.repository.CourseBookmarkRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseBookmarkService {

    private final CourseBookmarkRepository bookmarkRepository;
    private final CourseService courseService;
    private final UserService userService;

    @Transactional
    public CourseBookmarkResponseDto courseBookmarkCreate(Long userId, Long courseId) {
        // 코스 존재 검사
        Course course = courseService.getCourseById(courseId);
        User user = userService.getUserById(userId);
        // 북마크 중복 등록 검사
        if(bookmarkRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new CustomException(ErrorCode.BOOKMARK_ALREADY_EXISTS);
        }
        // 북마크 저장
        CourseBookmark bookmark = new CourseBookmark(user, course);
        CourseBookmark savedBookmark = bookmarkRepository.save(bookmark);
        // 북마크 수 +1
        course.incrementBookmarkCount();
        // 반환
        return new CourseBookmarkResponseDto(
                savedBookmark.getId(),
                savedBookmark.getUser().getId(),
                savedBookmark.getCourse().getId()
        );
    }

    @Transactional
    public void courseBookmarkDelete(Long userId, Long courseId) {
        // 코스 존재 검사
        Course course = courseService.getCourseById(courseId);
        // 북마크 존재 검사
        CourseBookmark bookmark = bookmarkRepository.findByUserIdAndCourseId(userId, courseId).orElseThrow(() -> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));
        // 북마크 hard delete
        bookmarkRepository.delete(bookmark);
        // 북마크 수 -1
        course.decrementBookmarkCount();
    }
}
