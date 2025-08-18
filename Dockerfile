# Spring Boot 애플리케이션용 Multi-stage Docker 빌드

# Build stage
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Gradle 의존성 파일들을 먼저 복사하여 캐싱 최적화
COPY build.gradle settings.gradle ./
COPY gradle/ ./gradle/

# 의존성 다운로드 (캐시 최적화)
RUN gradle dependencies --no-daemon

# 소스코드 복사
COPY src/ ./src/

# 애플리케이션 빌드 (테스트 제외)
RUN gradle build --no-daemon -x test

# Runtime stage  
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 애플리케이션 실행을 위한 사용자 생성 (보안)
RUN addgroup -S spring && adduser -S spring -G spring

# 필요한 패키지 설치 (healthcheck용)
RUN apk add --no-cache curl

# 빌드된 JAR 파일 복사
COPY --from=build --chown=spring:spring /app/build/libs/*.jar app.jar

USER spring:spring

# 포트 노출
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# JVM 메모리 최적화 옵션 포함
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]