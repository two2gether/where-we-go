package com.example.wherewego;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class SimpleIntegrationTest {

	@Test
	void contextLoads() {
		// Spring 컨텍스트가 정상적으로 로드되는지 확인
		// 별도의 데이터베이스나 외부 서비스 연결 없이 기본 로딩만 테스트
	}
}