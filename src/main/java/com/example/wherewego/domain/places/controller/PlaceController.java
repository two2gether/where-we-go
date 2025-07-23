package com.example.wherewego.domain.places.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.BookmarkCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.domain.places.dto.response.UserBookmarkListDto;
import com.example.wherewego.domain.places.service.GooglePlaceService;
import com.example.wherewego.domain.places.service.PlaceBookmarkService;
import com.example.wherewego.domain.places.service.PlaceService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.global.response.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 장소 검색 API 컨트롤러
 *
 * 구글 Places API를 통한 실시간 장소 검색 및 상세 정보 조회 기능을 제공합니다.
 * API 명세에 따른 통합 검색 엔드포인트를 구현합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

	private final GooglePlaceService googlePlaceService;
	private final PlaceBookmarkService placeBookmarkService;
	private final PlaceService placeService;

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
		log.info("장소 검색 요청 - 사용자: {}, 키워드: {}, 페이지: {}, 크기: {}",
			userId,
			request.getQuery(),
			request.getPagination() != null ? request.getPagination().getPage() : "기본값",
			request.getPagination() != null ? request.getPagination().getSize() : "기본값");

		// 위치 정보 로깅
		if (request.getUserLocation() != null) {
			log.info("위치 기반 검색 - 위도: {}, 경도: {}, 반경: {}m",
				request.getUserLocation().getLatitude(),
				request.getUserLocation().getLongitude(),
				request.getUserLocation().getRadius());
		}

		// 외부 API 호출 (구글 Places API)
		List<PlaceDetailResponse> searchResults = googlePlaceService.searchPlaces(request);
		log.info("장소 검색 완료 - 총 {}개 결과", searchResults.size());

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
		log.info("북마크 추가 요청 - 사용자: {}, 장소ID: {}", user.getId(), placeId);

		BookmarkCreateResponseDto result = placeBookmarkService.addBookmark(user.getId(), placeId);
		log.info("북마크 추가 성공 - 북마크ID: {}", result.getBookmarkId());

		return ResponseEntity.ok(
			ApiResponse.ok("북마크 추가 성공", result)
		);
	}

	/**
	 * 사용자 북마크 목록 조회 API
	 *
	 * GET /api/users/bookmarks
	 */
	@GetMapping("/users/bookmarks")
	public ResponseEntity<ApiResponse<UserBookmarkListDto>> getUserBookmarks(
			@AuthenticationPrincipal CustomUserDetail userDetail,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size,
			@RequestParam(required = false) Double userLatitude,
			@RequestParam(required = false) Double userLongitude) {

		User user = userDetail.getUser();
		log.info("사용자 북마크 목록 조회 - 사용자: {}, 페이지: {}", user.getId(), page);

		UserBookmarkListDto result = placeBookmarkService.getUserBookmarks(
				user.getId(), page, size, userLatitude, userLongitude);
		log.info("북마크 목록 조회 성공 - 총 {}개", result.getTotalElements());

		return ResponseEntity.ok(
				ApiResponse.ok("북마크 목록 조회 성공", result)
		);
	}
}