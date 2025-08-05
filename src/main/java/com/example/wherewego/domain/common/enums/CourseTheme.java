package com.example.wherewego.domain.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CourseTheme {
	HEALING("힐링"),
	SENSIBILITY("감성"),
	ANNIVERSARY("기념일"),
	ROMANTIC("로맨틱"),
	ACTIVITY("액티비티"),
	FOOD_TOUR("맛집탐방"),
	CAFE_TOUR("카페투어"),
	ONE_DAY("당일치기"),
	DAILY("일상"),
	HOT_PLACE("핫플"),
	DRIVE("드라이브"),
	BEST_SHOT("인생샷"),
	PICNIC("피크닉"),
	TRAVEL("여행"),
	RAINY_DAY("비오는날"),
	REFRESH("기분전환");

	private final String courseThemeName;
}