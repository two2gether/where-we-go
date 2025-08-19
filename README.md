<div align="center">
<img width="380" height="270" alt="image" src="https://github.com/user-attachments/assets/d94281ff-7211-4708-a149-d0b71b61d2f9" />

##   프로젝트 소개
개발 기간: 2025.7.16 ~ 2025.8.26

Where We Go는 사용자가 원하는 장소를 탐색하고, 이를 기반으로 자신만의 여행·데이트 코스를 설계하고 공유할 수 있는 Java Spring 기반의 여행 코스 플랫폼입니다.
사용자는 코스 생성, 장소 탐색, 소셜 로그인, 실시간 알림 등을 통해 풍부한 상호작용을 경험할 수 있으며, 이벤트 상품 결제까지 원스톱으로 즐길 수 있도록 설계되었습니다.

</div>

<div align="center">
  
## 팀원 소개

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/fe16f919-3b3c-48fe-9d22-3ae9e31b7ea8" width="150px" /><br/><br/>
      <b>팀장</b><br/>
      <a href="https://github.com/hyohee0613">이효희</a><br/>
      마이페이지(코스/북마크)<br/>
      댓글<br/>
      알림<br/>
      CI/CD
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/0b1d9fc4-e5ba-44e8-818e-cf3da16303e2" width="150px" /><br/>
      <b>부팀장</b><br/>
      <a href="https://github.com/balsohn">손지호</a><br/>
      마이페이지(장소/리뷰)<br/>
      장소/북마크<br/>
      이벤트상품(환불/상세)<br/>
      CI/CD
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/15afad8c-8a41-4efb-a4a2-91d43da99794" width="150px" /><br/>
      <b>팀원</b><br/>
      <a href="https://github.com/Geyapse">오세훈</a><br/>
      회원관리<br/>
      소셜로그인<br/>
      마이페이지<br/>
      동시성제어<br/>
      CI/CD
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/b019e0a2-25b3-4b46-a697-631cffd8f690" width="150px" /><br/>
      <b>팀원</b><br/>
      <a href="https://github.com/choi-hjung">최희정</a><br/>
      코스<br/>
      인기코스<br/>
      이벤트상품<br/>
      상품주문<br/>
      토스간편결제 연동
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/d96967d6-5b71-44ef-a46b-fd87b5a93396" width="150px" /><br/><br/>
      <b>팀원</b><br/>
      <a href="https://github.com/yebitt">송예빈</a><br/>
      마이페이지(좋아요)<br/>
      좋아요<br/>
      북마크<br/>
      평점<br/>
      캐싱 최적화
    </td>
  </tr>
</table>
</div>

## 1. 주요 기술 스택

**Backend**

<img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Boot-3.5.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Data%20JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white"> 

<img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white">

**Database**

<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white">

**CI/CD**

<img src="https://github.com/user-attachments/assets/ded60adb-ef68-4a43-8f7e-851708b310be">

**Collaboration & Tools**

<img src="https://img.shields.io/badge/IntelliJ%20IDEA-000000?style=for-the-badge&logo=intellijidea&logoColor=white"> <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"> <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"> <img width="86" height="28" alt="image" src="https://github.com/user-attachments/assets/04d17016-3bc4-4995-9e5b-13cf574f25a1" /> <img width="87" height="28" alt="image" src="https://github.com/user-attachments/assets/61d722d4-569e-4fae-bcf7-ee0661c09c0d" /> <img width="98" height="28" alt="image" src="https://github.com/user-attachments/assets/d393db29-1b16-4897-a766-3b8e62b54b18" />

## 2. 주요 기능

### **🙌 유저 서비스**

사용자는 이메일/소셜 계정으로 간편하게 회원가입하고 로그인할 수 있습니다.
기본 계정 관리 외에도 소셜 로그인으로 접근성을 높였습니다.

- **기본 계정 관리**: 로그인 / 회원가입 / 로그아웃 / 회원탈퇴
- **소셜 로그인**: 카카오, 구글 계정 연동

### **🏠 마이페이지 기능**

마이페이지에서는 나의 활동 내역과 알림을 한눈에 확인할 수 있습니다.
사용자는 자신의 기록을 모아보고 관리하면서 개인화된 서비스 경험을 완성할 수 있습니다.

- 내 코스 목록 조회
- 내 댓글 목록 조회
- 내 북마크 목록 조회 (장소 & 코스)
- 내 좋아요 목록 조회
- 내 알림 목록 조회
- 내 주문 목록 조회

### **📍 코스 기능**

[서비스의 핵심 기능✨]
**원하는 장소를 조합해 코스를 만들고**, 이를 평가와 공유를 하면서
다른 사용자들과 소통 및 상호작용을 할 수 있습니다.

- 코스 생성 / 수정 / 조회 / 삭제
- 평점 / 좋아요 / 북마크 등록·취소
→ 코스에 대한 사용자 간의 상호작용
- 댓글 생성 / 수정 / 조회 / 삭제
→ 코스에 대한 소통과 피드백

### **🏞️ 장소 기능**

검색 기능으로 새로운 공간을 탐색하고, 북마크나 리뷰로 의견을 공유할 수 있습니다.
구글 외부 API를 활용해 더 풍성한 장소 데이터를 제공합니다.

- 장소 검색 / 조회
- 북마크 등록 / 취소
- 리뷰 작성 / 수정 / 삭제

### **🎁 이벤트 상품 기능**

사용자는 여행·데이트와 연결된 다양한 이벤트 특가 상품을 주문하고 결제할 수 있습니다.

- 이벤트 상품 주문 / 결제 / 취소 / 환불

## 3. [API 명세서](https://www.notion.so/teamsparta/2322dc3ef5148183b842f8f93282dba2?v=2322dc3ef5148140ba5c000c1469c739&source=copy_link)

<img src="https://github.com/user-attachments/assets/0583cb05-b564-4bfa-a83c-acde225bf911" />

## 4. [ERD](https://www.erdcloud.com/d/F89pnoZpa5S8po6YG)

<img src="https://github.com/user-attachments/assets/0b958036-4ecc-4905-a485-de4e20bf555a" style="width:600px;" />

## 5. [아키텍처](https://www.notion.so/teamsparta/Where-We-Go-23b2dc3ef514807a970deadce5bf8484?source=copy_link)

<img src="https://github.com/user-attachments/assets/0cd13206-af3f-4092-8183-22b1ed6cac35" style="width:600px;" />

## 6. [성능 개선 & 트러블슈팅](https://www.notion.so/teamsparta/2542dc3ef51480f9b3f0cf961dc80e80?source=copy_link)
- # 🚀 동시 좋아요 처리 (Race Condition 방지)

## ① 문제 정의

- 동시에 같은 코스에 여러 사용자가 좋아요를 누르면  
  - 중복 레코드 시도 또는 `likeCount`가 실제와 어긋나는 **Race Condition** 발생 가능.

## ② 원인 분석

- `(userId, courseId)` 조합의 **중복 삽입 경쟁**
- 코스별 좋아요 수를 **동시에 증가**시키는 업데이트 충돌

## ③ 구현 내용 설명

### 🔧 해결 과정
- **행 단위 비관적 락**  
  → `CourseRepository.findByIdForUpdate(@Lock(PESSIMISTIC_WRITE))`로 코스 row 잠금  

- **DB 유니크 제약**  
  → `CourseLike`에 `uniqueConstraints (user_id, course_id)`  

- **MySQL 원자 동작 활용**  
  → `INSERT IGNORE`로 중복 삽입을 DB가 무시하도록 처리  
  (`CourseLikeRepository.insertIgnoreLike`)  

- **카운트 원자 업데이트**  
  ```sql
  update Course c 
  set c.likeCount = c.likeCount + 1 
  where c.id = :courseId
- 재고 감소 (동시 주문 시 과판매/실패 방지)
- 1인당 중복 구매 제한
- 캐싱 도입을 통한 API 응답 속도 및 시스템 안정성 개선
- Places 시스템 + 환불 시스템
- 콜백 중복 처리 개선
- Spring Security Multiple FilterChain 적용
- Spring AOP Self-invocation
- Jackson 역직렬화 오류
- 재시도 로직
→ PessimisticLockingFailureException 발생 시 최대 4회, 20ms*(i+1) 백오프 재시도

- 캐시 일관성 유지
→ 생성 성공 시 Redis 키
course-like-list::userId:{userId}:* 패턴 삭제로 목록 캐시 무효화

- 알림 발행
→ notificationService.triggerLikeNotification(user, course) 호출

## ④ 결과와 효과

- ✅ 중복 좋아요 방지: 유니크 + INSERT IGNORE로 DB 차원에서 차단
- ✅ 정확한 카운트: 잠금 + 원자식 업데이트로 likeCount 일치
- ✅ 일시적 충돌 회복: 재시도로 사용자 체감 오류 감소
- ✅ UX 개선: 좋아요 수가 안정적으로 즉시 반영

## 🔐 Spring Security Multiple FilterChain 적용

### ① 문제 상황
- 새로운 **공개 API 추가 시 403 에러 발생**
- `SecurityConfig` + `JwtFilter` 두 곳에 **중복 설정 필요**
- `JwtFilter`가 `SecurityConfig`보다 먼저 실행되어 `permitAll()` 무시

---

### ② 문제 분석
- 기존 구조: **Single FilterChain**
- 개선 방향: **Multiple FilterChain**

```java
@Bean
@Order(1)  // 공개 API용 - JWT Filter 없음
public SecurityFilterChain publicApiFilterChain(HttpSecurity http) throws Exception {
    return http
            .securityMatcher("/api/auth/**", "/health")
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .build();
}

@Bean
@Order(2)  // 인증 API용 - JWT Filter 있음
public SecurityFilterChain privateApiFilterChain(HttpSecurity http) throws Exception {
    return http
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
            .build();
}

---

### ③ 문제 해결

- **SecurityConfig**  
  - Single → Multiple FilterChain 구조로 분리  

- **JwtFilter**  
  - `@Component` 제거  
  - 역할 단순화 → 토큰 검증만 담당  

- **AuthService**  
  - `CustomException` 패턴 통일  

---

### ✅ 개선 결과
- 공개 API 추가 시 **SecurityConfig에서만 관리** 가능 → 유지보수 용이  
- `permitAll()` 정상 반영 → 불필요한 403 에러 제거  
- 인증/비인증 로직 명확히 분리 → 가독성 및 확장성 증가 
