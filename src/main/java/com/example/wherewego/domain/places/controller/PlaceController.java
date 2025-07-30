package com.example.wherewego.domain.places.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.BookmarkCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.BookmarkDeleteResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.domain.places.service.PlaceBookmarkService;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 장소 검색 API 컨트롤러
 *
 * Place API를 통한 실시간 장소 검색 및 상세 정보 조회 기능을 제공합니다.
 * API 명세에 따른 통합 검색 엔드포인트를 구현합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

	private final PlaceService placeService;
	private final PlaceBookmarkService placeBookmarkService;

	/**
	 * 장소 검색 API
	 *
	 * POST /api/places/search
	 *
	 * 통합 장소 검색 기능을 제공합니다.
	 * userLocation 파라미터는 선택사항이며, 포함될 경우 거리 기반 정렬이 가능합니다.
	 *
	 * @param request 장소 검색 요청 데이터
	 * @return ApiResponse<List < PlaceDetailResponse>> 장소 검색 결과
	 */
	@PostMapping("/search")
	public ResponseEntity<ApiResponse<List<PlaceDetailResponse>>> searchPlaces(
		@Valid @RequestBody PlaceSearchRequest request,
		@AuthenticationPrincipal CustomUserDetail userDetail) {

		Long userId = userDetail != null ? userDetail.getUser().getId() : null;

		// PlaceService에서 거리 계산 및 북마크 상태를 포함한 검색 처리
		List<PlaceDetailResponse> searchResults = placeService.searchPlacesWithDistance(request, userId);


		return ResponseEntity.ok(
			ApiResponse.ok("장소 검색 성공", searchResults)
		);
	}

	/**
	 * 장소 북마크 추가 API
	 *
	 * POST /api/places/{placeId}/bookmark
	 */
	@PostMapping("/{placeId}/bookmark")
	public ResponseEntity<ApiResponse<BookmarkCreateResponseDto>> addBookmark(
		@PathVariable String placeId,
		@AuthenticationPrincipal CustomUserDetail userDetail) {

		User user = userDetail.getUser();

		BookmarkCreateResponseDto result = placeBookmarkService.addBookmark(user.getId(), placeId);

		return ResponseEntity.ok(
			ApiResponse.ok("북마크 추가 성공", result)
		);
	}

	/**
	 * 장소 북마크 제거 API
	 *
	 * DELETE /api/places/{placeId}/bookmark
	 */
	@DeleteMapping("/{placeId}/bookmark")
	public ResponseEntity<ApiResponse<BookmarkDeleteResponseDto>> removeBookmark(
		@PathVariable String placeId,
		@AuthenticationPrincipal CustomUserDetail userDetail) {

		User user = userDetail.getUser();

		placeBookmarkService.removeBookmark(user.getId(), placeId);

		BookmarkDeleteResponseDto result = BookmarkDeleteResponseDto.builder()
			.isBookmarked(false)
			.build();


		return ResponseEntity.ok(
			ApiResponse.ok("북마크 제거 성공", result)
		);
	}

	/**
	 * 장소 상세 정보 조회 API
	 *
	 * GET /api/places/{placeId}/details
	 */
	@GetMapping("/{placeId}/details")
	public ResponseEntity<ApiResponse<PlaceDetailResponse>> getPlaceDetails(
		@PathVariable String placeId,
		@AuthenticationPrincipal CustomUserDetail userDetail) {


		// PlaceService에서 장소 정보 조회 (통계 정보 포함)
		User user = userDetail != null ? userDetail.getUser() : null;
		PlaceDetailResponse placeDetail = placeService.getPlaceDetailWithStats(placeId,
			user != null ? user.getId() : null);


		return ResponseEntity.ok(
			ApiResponse.ok("장소 상세 정보 조회 성공", placeDetail)
		);
	}
}