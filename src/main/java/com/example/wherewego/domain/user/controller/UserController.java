package com.example.wherewego.domain.user.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.courses.dto.response.CommentResponseDto;
import com.example.wherewego.domain.courses.service.CommentService;
import com.example.wherewego.domain.places.dto.response.UserBookmarkListDto;
import com.example.wherewego.domain.places.service.PlaceBookmarkService;
import com.example.wherewego.domain.user.dto.MyPageResponseDto;
import com.example.wherewego.domain.user.dto.MyPageUpdateRequestDto;
import com.example.wherewego.domain.user.dto.WithdrawRequestDto;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.response.ApiResponse;
import com.example.wherewego.global.response.PagedResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 사용자 및 마이페이지 관리 REST API 컨트롤러
 * 
 * 사용자 계정 관리, 마이페이지 조회 및 수정, 개인 데이터 관리 기능을 제공합니다.
 * 회원 탈퇴, 프로필 수정, 내가 작성한 댓글 및 북마크 목록 조회 기능을 포함합니다.
 * 모든 API는 인증된 사용자만 접근 가능하며, 개인정보 보호를 위한 보안 검증을 포함합니다.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

	private final UserService userService;
	private final CommentService commentService;
	private final PlaceBookmarkService placeBookmarkService;

	/**
	 * 회원 탈퇴 API
	 * 
	 * DELETE /api/users/withdraw
	 * 
	 * 인증된 사용자의 회원 탈퇴를 처리합니다.
	 * 탈퇴 전 비밀번호 확인을 통해 보안을 보장하며,
	 * 탈퇴 처리 후 관련 데이터는 정책에 따라 처리됩니다.
	 * 
	 * @param userDetails 인증된 사용자 정보
	 * @param request 탈퇴 요청 데이터 (비밀번호 확인 포함)
	 * @return 빈 응답과 성공 메시지
	 */
	@DeleteMapping("/withdraw")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ApiResponse<Void> withdraw(
		@AuthenticationPrincipal CustomUserDetail userDetails,
		@Valid @RequestBody WithdrawRequestDto request
	) {
		userService.withdraw(userDetails.getId(), request.getPassword());

		return ApiResponse.noContent("회원 탈퇴가 완료되었습니다.");
	}

	/**
	 * 마이페이지 조회 API
	 * 
	 * GET /api/users/mypage
	 * 
	 * 인증된 사용자의 마이페이지 정보를 조회합니다.
	 * 사용자 기본 정보, 프로필 사진, 닉네임 등의 정보를 포함합닄다.
	 * 개인정보 보호를 위해 자신의 정보만 조회 가능합니다.
	 * 
	 * @param userDetail 인증된 사용자 정보
	 * @return 마이페이지 정보 (사용자 프로필 데이터)
	 */
	@GetMapping("/mypage")
	public ApiResponse<MyPageResponseDto> getMyPage(
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		Long userId = userDetail.getId();
		MyPageResponseDto response = userService.getUserProfileInfo(userId);

		return ApiResponse.ok("마이페이지 화면입니다.", response);
	}

	/**
	 * 내가 작성한 댓글 목록 조회 API
	 * 
	 * GET /api/users/mypage/comments
	 * 
	 * 인증된 사용자가 작성한 모든 댓글을 페이지단위로 조회합니다.
	 * 댓글은 작성일 내림차순으로 정렬되며, 해당 코스 정보도 함께 제공됩니다.
	 * 삭제된 댓글이나 비공개 코스의 댓글도 필터링되어 제공됩니다.
	 * 
	 * @param userDetail 인증된 사용자 정보
	 * @param pageable 페이지네이션 정보 (기본: 10개씩, 작성일 내림차순)
	 * @return 페이지네이션된 댓글 목록
	 */
	@GetMapping("/mypage/comments")
	public ApiResponse<PagedResponse<CommentResponseDto>> getMyComments(
		@AuthenticationPrincipal CustomUserDetail userDetail,
		@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		Long userId = userDetail.getUser().getId();
		PagedResponse<CommentResponseDto> response = commentService.getCommentsByUser(userId, pageable);

		return ApiResponse.ok("내가 작성한 댓글 목록 조회에 성공했습니다.", response);
	}

	/**
	 * 마이페이지 수정 API
	 * 
	 * PUT /api/users/mypage
	 * 
	 * 인증된 사용자의 프로필 정보를 수정합니다.
	 * 닉네임, 프로필 사진 등의 정보를 업데이트할 수 있습니다.
	 * 유효성 검증을 통해 데이터 무결성을 보장하며, 중복 닉네임 검사를 포함합니다.
	 * 
	 * @param userDetail 인증된 사용자 정보
	 * @param request 마이페이지 수정 요청 데이터
	 * @return 수정된 마이페이지 정보
	 */
	@PutMapping("/mypage")
	public ApiResponse<MyPageResponseDto> updateMyPage(
		@AuthenticationPrincipal CustomUserDetail userDetail,
		@Valid @RequestBody MyPageUpdateRequestDto request
	) {
		MyPageResponseDto response = userService.updateMyPage(userDetail.getUser().getId(), request);

		return ApiResponse.ok("프로필이 성공적으로 수정되었습니다.", response);
	}

	/**
	 * 내 북마크 목록 조회 API
	 * 
	 * GET /api/users/mypage/bookmarks
	 * 
	 * 인증된 사용자가 북마크한 모든 장소를 조회합니다.
	 * 각 북마크에 대해 실시간 장소 정보를 외부 API를 통해 가져오며,
	 * 사용자 위치가 제공된 경우 각 장소와의 거리를 계산하여 제공합니다.
	 * 
	 * @param userDetail 인증된 사용자 정보
	 * @param page 페이지 번호 (기본: 0)
	 * @param size 페이지당 아이템 수 (기본: 20)
	 * @param userLatitude 사용자 위치 위도 (거리 계산용, 선택사항)
	 * @param userLongitude 사용자 위치 경도 (거리 계산용, 선택사항)
	 * @return 북마크된 장소 목록과 페이지네이션 정보
	 */
	@GetMapping("/mypage/bookmarks")
	public ApiResponse<UserBookmarkListDto> getMyBookmarks(
		@AuthenticationPrincipal CustomUserDetail userDetail,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size,
		@RequestParam(required = false) Double userLatitude,
		@RequestParam(required = false) Double userLongitude
	) {
		Long userId = userDetail.getUser().getId();
		UserBookmarkListDto response = placeBookmarkService.getUserBookmarks(
			userId, page, size, userLatitude, userLongitude);

		return ApiResponse.ok("내 북마크 목록 조회 성공", response);
	}

}
