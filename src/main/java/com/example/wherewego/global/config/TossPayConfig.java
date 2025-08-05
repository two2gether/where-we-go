// package com.example.wherewego.global.config;
//
// import java.util.Base64;
//
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.MediaType;
// import org.springframework.web.reactive.function.client.WebClient;
//
// @Configuration
// public class TossPayConfig {
// 	@Value("${toss.secret-key}")
// 	private String secretKey;
//
// 	@Bean
// 	public WebClient tossWebClient() {
// 		String encodedKey = Base64.getEncoder().encodeToString((secretKey + ":").getBytes());
// 		return WebClient.builder()
// 			.baseUrl("https://api.tosspayments.com")
// 			.defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + encodedKey)
// 			.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
// 			.build();
// 	}
// }
