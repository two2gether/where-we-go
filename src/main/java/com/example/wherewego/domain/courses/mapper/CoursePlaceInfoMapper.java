package com.example.wherewego.domain.courses.mapper;

import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;

public class CoursePlaceInfoMapper {

	public static CoursePlaceInfo toDto(
		CoursePlaceInfo place,
		int visitOrder,
		Integer distanceFromUser,
		Integer distanceFromPrevious
	) {
		return CoursePlaceInfo.builder()
			.placeId(place.getPlaceId())
			.name(place.getName())
			.category(place.getCategory())
			.latitude(place.getLatitude())
			.longitude(place.getLongitude())
			.distanceFromUser(distanceFromUser)
			.distanceFromPrevious(distanceFromPrevious)
			.visitOrder(visitOrder)
			.imageUrl(place.getImageUrl())
			.build();
	}

	// 단순 매핑용 (거리 계산 없이)
	public static CoursePlaceInfo toDto(CoursePlaceInfo place, int visitOrder) {
		return toDto(place, visitOrder, null, null);
	}
}
