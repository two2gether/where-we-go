package com.example.wherewego.domain.auth.dto.social;

import java.util.Map;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoUserInfo {
	private String id;
	private String email;
	private String nickname;

	public KakaoUserInfo(Map<String, Object> attributes) {
		this.id = String.valueOf(attributes.get("id"));
		Map<String, Object> kakaoAccount = (Map<String, Object>)attributes.get("kakao_account");
		this.email = (String)kakaoAccount.get("email");

		Map<String, Object> profile = (Map<String, Object>)kakaoAccount.get("profile");
		this.nickname = profile != null ? (String)profile.get("nickname") : null;
	}

}
