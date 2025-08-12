package com.example.wherewego.domain.places.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.wherewego.domain.auth.security.CustomUserDetail;
import com.example.wherewego.domain.places.dto.request.PlaceSearchRequestDto;
import com.example.wherewego.domain.places.dto.response.BookmarkCreateResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;
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
@RequiredArgsConstructor
public class PlaceController {

	private final PlaceService placeService;
	private final PlaceBookmarkService placeBookmarkService;

	/**
	 * 장소 검색 API
	 *
	 * POST /api/places/search
	 *
	 * 구글 Places API를 통한 실시간 장소 검색 기능을 제공합니다.
	 * 사용자 위치가 제공된 경우 거리 계산 및 거리순 정렬을 지원합니다.
	 * 각 장소에 대해 북마크 상태, 리뷰 통계, 평점 등의 부가 정보를 포함합니다.
	 *
	 * @param request 검색 요청 데이터 (검색어, 사용자 위치, 반경 등)
	 * @param userDetail 인증된 사용자 정보 (북마크 상태 확인용, null 가능)
	 * @return 검색된 장소 목록과 부가 정보
	 */
	@PostMapping("/api/places/search")
	public ApiResponse<List<PlaceDetailResponseDto>> searchPlaces(
		@Valid @RequestBody PlaceSearchRequestDto request,
		@AuthenticationPrincipal CustomUserDetail userDetail) {

		Long userId = userDetail != null ? userDetail.getUser().getId() : null;

		// PlaceService에서 거리 계산 및 북마크 상태를 포함한 검색 처리
		List<PlaceDetailResponseDto> searchResults = placeService.searchPlacesWithDistance(request, userId);

		return ApiResponse.ok("장소 검색 성공", searchResults);
	}

	/**
	 * 장소 북마크 추가 API
	 *
	 * POST /api/places/{placeId}/bookmark
	 *
	 * 인증된 사용자가 특정 장소를 북마크에 추가합니다.
	 * 이미 북마크된 장소인 경우 오류를 반환합니다.
	 * 성공 시 북마크 ID와 상태 정보를 반환합니다.
	 *
	 * @param placeId 북마크할 장소의 고유 ID
	 * @param userDetail 인증된 사용자 정보 (필수)
	 * @return 북마크 생성 결과 (북마크 ID, 상태 포함)
	 */
	@PostMapping("/api/places/{placeId}/bookmark")
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResponse<BookmarkCreateResponseDto> addBookmark(
		@PathVariable String placeId,
		@AuthenticationPrincipal CustomUserDetail userDetail) {

		User user = userDetail.getUser();

		BookmarkCreateResponseDto result = placeBookmarkService.addBookmark(user.getId(), placeId);

		return ApiResponse.created("북마크 추가 성공", result);
	}

	/**
	 * 장소 북마크 제거 API
	 *
	 * DELETE /api/places/{placeId}/bookmark
	 *
	 * 인증된 사용자의 특정 장소 북마크를 제거합니다.
	 * 북마크가 존재하지 않는 경우 오류를 반환합니다.
	 * 성공 시 빈 응답과 함께 성공 메시지를 반환합니다.
	 *
	 * @param placeId 북마크를 제거할 장소의 고유 ID
	 * @param userDetail 인증된 사용자 정보 (필수)
	 * @return 빈 응답과 성공 메시지
	 */
	@DeleteMapping("/api/places/{placeId}/bookmark")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public ApiResponse<Void> removeBookmark(
		@PathVariable String placeId,
		@AuthenticationPrincipal CustomUserDetail userDetail
	) {
		User user = userDetail.getUser();
		placeBookmarkService.removeBookmark(user.getId(), placeId);

		return ApiResponse.noContent("북마크가 삭제되었습니다.");
	}

	/**
	 * 장소 상세 정보 조회 API
	 *
	 * GET /api/places/{placeId}/details
	 *
	 * 특정 장소의 상세 정보를 조회합니다.
	 * 구글 Places API에서 기본 정보를 가져오고, 우리 서비스의 통계 정보(리뷰, 북마크 등)를 결합합니다.
	 * 인증된 사용자인 경우 개인화된 정보(북마크 상태, 리뷰 작성 여부)를 포함합니다.
	 *
	 * @param placeId 조회할 장소의 고유 ID
	 * @param userDetail 인증된 사용자 정보 (개인화 정보용, null 가능)
	 * @return 장소 상세 정보와 통계 데이터
	 */
	@GetMapping("/api/places/{placeId}/details")
	public ApiResponse<PlaceDetailResponseDto> getPlaceDetails(
		@PathVariable String placeId,
		@AuthenticationPrincipal CustomUserDetail userDetail) {

		// PlaceService에서 장소 정보 조회 (통계 정보 포함)
		Long userId = userDetail != null ? userDetail.getUser().getId() : null;
		PlaceDetailResponseDto placeDetail = placeService.getPlaceDetailWithStats(placeId, userId);

		return ApiResponse.ok("장소 상세 정보 조회 성공", placeDetail);
	}
}