package com.example.wherewego;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("CI/CD에서는 contextLoads 테스트를 제외합니다.")
@SpringBootTest
class WhereWeGoApplicationTests {

	@Test
	void contextLoads() {
	}

}
