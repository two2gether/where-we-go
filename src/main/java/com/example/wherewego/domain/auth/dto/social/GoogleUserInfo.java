package com.example.wherewego.domain.auth.dto.social;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleUserInfo {
	private String id;
	private String email;
	private boolean verified_email;
	private String given_name;
	private String family_name;
	private String name;
	private String picture;
}
