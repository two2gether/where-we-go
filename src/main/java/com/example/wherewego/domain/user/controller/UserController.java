package com.example.wherewego.domain.user.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.response.CommentResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.service.CommentService;
import com.example.wherewego.domain.places.dto.response.UserBookmarkListDto;
import com.example.wherewego.domain.places.service.PlaceBookmarkService;
import com.example.wherewego.domain.courses.service.CourseService;
import com.example.wherewego.domain.user.dto.MyPageResponseDto;
import com.example.wherewego.domain.user.dto.MyPageUpdateRequestDto;
import com.example.wherewego.domain.user.dto.WithdrawRequestDto;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

	private final UserService userService;
	private final CommentService commentService;
	private final PlaceBookmarkService placeBookmarkService;
	private final CourseService courseService;

	@DeleteMapping("/withdraw")
	public ResponseEntity<ApiResponse<Void>> withdraw(
		@AuthenticationPrincipal CustomUserDetail userDetails,
		@Valid @RequestBody WithdrawRequestDto dto
	) {

		userService.withdraw(userDetails.getId(), dto.getPassword());
		return ResponseEntity.ok(
			ApiResponse.ok("회원 탈퇴가 완료되었습니다.", null)
		);
	}

	@GetMapping("/mypage")
	public ResponseEntity<ApiResponse<MyPageResponseDto>> myPage(
		@AuthenticationPrincipal CustomUserDetail principal
	) {
		Long userId = principal.getId();

		MyPageResponseDto dto = userService.myPage(userId);

		ApiResponse<MyPageResponseDto> response = ApiResponse.ok(
			"마이페이지 화면입니다.", dto
		);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/mypage/comments")
	public ResponseEntity<ApiResponse<PagedResponse<CommentResponseDto>>> getMyComments(
		@AuthenticationPrincipal CustomUserDetail principal,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
		Pageable pageable
	) {
		Long userId = principal.getUser().getId();

		// commentService 인스턴스를 사용해서 호출

		PagedResponse<CommentResponseDto> page = commentService.getCommentsByUser(userId, pageable);
		return ResponseEntity.ok(ApiResponse.ok("내가 작성한 댓글 목록 조회에 성공했습니다.", page));
	}

	@PutMapping("/mypage")
	public ResponseEntity<ApiResponse<MyPageResponseDto>> updateMyPage(
		@AuthenticationPrincipal CustomUserDetail principal,
		@Valid @RequestBody MyPageUpdateRequestDto dto
	) {
		MyPageResponseDto updated = userService.updateMyPage(principal.getUser().getId(), dto);
		return ResponseEntity.ok(ApiResponse.ok("프로필이 성공적으로 수정되었습니다.", updated));
	}

	/**
	 * 마이페이지 - 내 북마크 목록 조회 API
	 *
	 * GET /api/users/mypage/bookmarks
	 */
	@GetMapping("/mypage/bookmarks")
	public ResponseEntity<ApiResponse<UserBookmarkListDto>> getMyBookmarks(
		@AuthenticationPrincipal CustomUserDetail userDetail,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		@RequestParam(required = false) Double userLatitude,
		@RequestParam(required = false) Double userLongitude) {

		Long userId = userDetail.getUser().getId();
		UserBookmarkListDto bookmarks = placeBookmarkService.getUserBookmarks(
			userId, page, size, userLatitude, userLongitude);

		return ResponseEntity.ok(
			ApiResponse.ok("내 북마크 목록 조회 성공", bookmarks)
		);
	}

	// 내가 만든 코스 목록 조회
	@GetMapping("/mypage/courses")
	public ResponseEntity<ApiResponse<PagedResponse<CourseListResponseDto>>> getMyCourses(
		@AuthenticationPrincipal CustomUserDetail principal,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
		Pageable pageable
	) {
		Long userId = principal.getUser().getId();

		PagedResponse<CourseListResponseDto> page = courseService.getCoursesByUser(userId, pageable);

		return ResponseEntity.ok(ApiResponse.ok("내가 만든 코스 목록 조회에 성공했습니다.", page));
	}

}
