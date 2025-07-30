# API 연결 테스트 가이드

## 🧪 테스트 방법

### 1. 브라우저에서 확인
1. 프론트엔드: `http://localhost:3003`
2. 백엔드: `http://localhost:8080`

### 2. 기본 연결 테스트

#### 2.1 홈페이지 접속
- URL: `http://localhost:3003`
- 예상 결과: Where We Go 홈페이지가 정상적으로 로드됨

#### 2.2 코스 페이지 테스트
- URL: `http://localhost:3003/courses`
- 예상 결과: 
  - 로딩 스피너 표시 후 코스 목록 로드
  - 검색 및 필터 기능 작동
  - 좋아요 버튼 클릭 시 API 호출

#### 2.3 장소 페이지 테스트
- URL: `http://localhost:3003/places`
- 예상 결과:
  - 로딩 스피너 표시 후 장소 목록 로드
  - 검색 및 필터 기능 작동
  - 북마크 버튼 클릭 시 API 호출

#### 2.4 로그인 페이지 테스트
- URL: `http://localhost:3003/login`
- 예상 결과:
  - 로그인/회원가입 폼 표시
  - 폼 제출 시 백엔드 API 호출
  - 성공/실패 메시지 표시

### 3. 개발자 도구에서 확인

#### 3.1 Network 탭
- API 요청이 `http://localhost:8080/api/*` 로 전송되는지 확인
- 응답 상태 코드 확인 (200, 401, 404 등)

#### 3.2 Console 탭
- 에러 메시지 확인
- API 호출 로그 확인

### 4. 예상되는 문제들

#### 4.1 CORS 오류
```
Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost:3003' has been blocked by CORS policy
```
**해결방법**: 백엔드에서 CORS 설정 확인 필요

#### 4.2 백엔드 서버 연결 실패
```
GET http://localhost:8080/api/... net::ERR_CONNECTION_REFUSED
```
**해결방법**: 백엔드 서버가 8080 포트에서 실행 중인지 확인

#### 4.3 인증 관련 오류
```
401 Unauthorized
```
**해결방법**: JWT 토큰 처리 로직 확인

### 5. 테스트 시나리오

#### 시나리오 1: 회원가입
1. `/login` 페이지 접속
2. "회원가입하기" 클릭
3. 회원가입 폼 작성 및 제출
4. 성공 시 홈페이지로 리다이렉트

#### 시나리오 2: 로그인
1. `/login` 페이지 접속
2. 로그인 폼 작성 및 제출
3. 성공 시 홈페이지로 리다이렉트
4. 헤더에 사용자 정보 표시

#### 시나리오 3: 코스 검색
1. `/courses` 페이지 접속
2. 검색어 입력 또는 필터 선택
3. 검색 결과 표시
4. 좋아요 버튼 클릭 테스트

#### 시나리오 4: 장소 북마크
1. `/places` 페이지 접속
2. 장소 카드에서 북마크 버튼 클릭
3. 북마크 상태 변경 확인

## 🔧 문제 해결

### 백엔드 CORS 설정 예시
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3003")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### JWT 설정 확인
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3003"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## 📋 체크리스트

- [ ] 프론트엔드 서버 실행 (포트 3003)
- [ ] 백엔드 서버 실행 (포트 8080)
- [ ] 홈페이지 로드 확인
- [ ] 코스 페이지 API 연동 확인
- [ ] 장소 페이지 API 연동 확인
- [ ] 로그인/회원가입 API 연동 확인
- [ ] CORS 설정 확인
- [ ] JWT 토큰 처리 확인
- [ ] 에러 처리 확인

모든 항목이 체크되면 API 연동이 완료됩니다! 🎉