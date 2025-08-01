package com.example.wherewego.domain.courses.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.dto.response.CourseBookmarkResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.courses.entity.CourseBookmark;
import com.example.wherewego.domain.courses.repository.CourseBookmarkRepository;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;

/**
 * 코스 북마크 관리 서비스
 * 사용자의 코스 북마크 추가 및 삭제 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class CourseBookmarkService {

	private final CourseBookmarkRepository bookmarkRepository;
	private final CourseService courseService;
	private final UserService userService;

	/**
	 * 코스에 북마크를 추가합니다.
	 * 중복 북마크를 방지하고 코스의 북마크 수를 증가시킵니다.
	 * 
	 * @param userId 북마크를 추가할 사용자 ID
	 * @param courseId 북마크를 추가할 코스 ID
	 * @return 생성된 북마크 정보
	 * @throws CustomException 코스/사용자를 찾을 수 없거나 이미 북마크가 존재하는 경우
	 */
	@Transactional
	public CourseBookmarkResponseDto createCourseBookmark(Long userId, Long courseId) {
		// 코스 존재 검사
		Course course = courseService.getCourseById(courseId);
		User user = userService.getUserById(userId);
		// 북마크 중복 등록 검사
		if (bookmarkRepository.existsByUserIdAndCourseId(userId, courseId)) {
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

	/**
	 * 코스에서 북마크를 삭제합니다.
	 * 북마크를 완전히 삭제하고 코스의 북마크 수를 감소시킵니다.
	 * 
	 * @param userId 북마크를 삭제할 사용자 ID
	 * @param courseId 북마크를 삭제할 코스 ID
	 * @throws CustomException 코스를 찾을 수 없거나 북마크가 존재하지 않는 경우
	 */
	@Transactional
	public void deleteCourseBookmark(Long userId, Long courseId) {
		// 코스 존재 검사
		Course course = courseService.getCourseById(courseId);
		// 북마크 존재 검사
		CourseBookmark bookmark = bookmarkRepository.findByUserIdAndCourseId(userId, courseId)
			.orElseThrow(() -> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));
		// 북마크 hard delete
		bookmarkRepository.delete(bookmark);
		// 북마크 수 -1
		course.decrementBookmarkCount();
	}

}
