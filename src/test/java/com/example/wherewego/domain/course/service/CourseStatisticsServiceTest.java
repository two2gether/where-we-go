package com.example.wherewego.domain.courses.service;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.global.exception.CustomException;

/**
 * CourseStatisticsService 단위 테스트
 *
 * 테스트 범위:
 * - 평점 추가/제거 시 통계 계산 검증
 * - 일일 인기 점수 계산 검증
 * - 평점 재계산 기능 검증
 * - 입력 데이터 유효성 검증
 * - 경계값 및 예외 상황 처리
 * - 수학적 계산 정확성 검증
 */
@ExtendWith(MockitoExtension.class)
class CourseStatisticsServiceTest {

	@InjectMocks
	private CourseStatisticsService courseStatisticsService;

	@Mock
	private Course mockCourse;

	private Course realCourse; // 실제 Course 객체 (통계 업데이트 확인용)

	@BeforeEach
	void setUp() {
		// 실제 Course 객체 생성 (mock이 아닌 실제 객체로 통계 업데이트 확인)
		User testUser = User.builder()
			.id(1L)
			.email("test@example.com")
			.nickname("테스터")
			.build();

		realCourse = Course.builder()
			.id(1L)
			.title("서울 가을 여행")
			.region("서울")
			.user(testUser)
			.ratingSum(10.0)      // 기존 평점 합계
			.ratingCount(2)       // 기존 평점 개수
			.averageRating(5.0)   // 기존 평균 평점
			.likeCount(15)        // 좋아요 수
			.viewCount(100)       // 조회수
			.bookmarkCount(8)     // 북마크 수
			.commentCount(5)      // 댓글 수
			.build();
	}

	@Nested
	@DisplayName("평점 추가 테스트")
	class AddCourseRatingTest {

		@Test
		@DisplayName("평점 추가 시 통계 정확히 업데이트")
		void addRatingUpdatesStatisticsCorrectly() {
			// given
			Double newRating = 4.0;

			// when
			courseStatisticsService.addRating(realCourse, newRating);

			// then
			assertThat(realCourse.getRatingSum()).isEqualTo(14.0); // 10.0 + 4.0
			assertThat(realCourse.getRatingCount()).isEqualTo(3);   // 2 + 1
			assertThat(realCourse.getAverageRating()).isEqualTo(4.7); // 14.0/3 = 4.666... -> 4.7 (반올림)
		}

		@Test
		@DisplayName("첫 번째 평점 추가 시 올바른 계산")
		void addFirstRating() {
			// given
			Course emptyCourse = Course.builder()
				.id(2L)
				.title("새 코스")
				.region("부산")
				.user(User.builder().id(1L).build())
				.ratingSum(0.0)
				.ratingCount(0)
				.averageRating(0.0)
				.build();
			Double firstRating = 5.0;

			// when
			courseStatisticsService.addRating(emptyCourse, firstRating);

			// then
			assertThat(emptyCourse.getRatingSum()).isEqualTo(5.0);
			assertThat(emptyCourse.getRatingCount()).isEqualTo(1);
			assertThat(emptyCourse.getAverageRating()).isEqualTo(5.0);
		}

		@Test
		@DisplayName("평균 계산 반올림 정확성 검증")
		void addRatingRoundingAccuracy() {
			// given - 반올림 케이스 테스트
			Course testCourse = Course.builder()
				.id(3L)
				.title("반올림 테스트")
				.region("대구")
				.user(User.builder().id(1L).build())
				.ratingSum(7.0)  // 기존 합계
				.ratingCount(2)  // 기존 개수
				.averageRating(3.5)
				.build();
			Double newRating = 2.0; // 추가 후: 9.0/3 = 3.0 (정수)

			// when
			courseStatisticsService.addRating(testCourse, newRating);

			// then
			assertThat(testCourse.getAverageRating()).isEqualTo(3.0);
		}

		@Test
		@DisplayName("경계값 테스트 - 최소 평점(1.0) 추가")
		void addMinimumRating() {
			// given
			Double minimumRating = 1.0;

			// when & then
			assertThatCode(() -> courseStatisticsService.addRating(realCourse, minimumRating))
				.doesNotThrowAnyException();

			assertThat(realCourse.getRatingSum()).isEqualTo(11.0); // 10.0 + 1.0
			assertThat(realCourse.getRatingCount()).isEqualTo(3);
			assertThat(realCourse.getAverageRating()).isEqualTo(3.7); // 11.0/3 = 3.666... -> 3.7
		}

		@Test
		@DisplayName("경계값 테스트 - 최대 평점(5.0) 추가")
		void addMaximumRating() {
			// given
			Double maximumRating = 5.0;

			// when & then
			assertThatCode(() -> courseStatisticsService.addRating(realCourse, maximumRating))
				.doesNotThrowAnyException();

			assertThat(realCourse.getRatingSum()).isEqualTo(15.0); // 10.0 + 5.0
			assertThat(realCourse.getRatingCount()).isEqualTo(3);
			assertThat(realCourse.getAverageRating()).isEqualTo(5.0); // 15.0/3 = 5.0
		}
	}

	@Nested
	@DisplayName("평점 제거 테스트")
	class RemoveCourseRatingTest {

		@Test
		@DisplayName("평점 제거 시 통계 정확히 업데이트")
		void removeRatingUpdatesStatisticsCorrectly() {
			// given
			Double ratingToRemove = 5.0;

			// when
			courseStatisticsService.removeRating(realCourse, ratingToRemove);

			// then
			assertThat(realCourse.getRatingSum()).isEqualTo(5.0); // 10.0 - 5.0
			assertThat(realCourse.getRatingCount()).isEqualTo(1); // 2 - 1
			assertThat(realCourse.getAverageRating()).isEqualTo(5.0); // 5.0/1 = 5.0
		}

		@Test
		@DisplayName("마지막 평점 제거 시 통계 초기화")
		void removeLastRating() {
			// given
			Course singleRatingCourse = Course.builder()
				.id(2L)
				.title("단일 평점 코스")
				.region("인천")
				.user(User.builder().id(1L).build())
				.ratingSum(4.0)
				.ratingCount(1)
				.averageRating(4.0)
				.build();
			Double ratingToRemove = 4.0;

			// when
			courseStatisticsService.removeRating(singleRatingCourse, ratingToRemove);

			// then
			assertThat(singleRatingCourse.getRatingSum()).isEqualTo(0.0);
			assertThat(singleRatingCourse.getRatingCount()).isEqualTo(0);
			assertThat(singleRatingCourse.getAverageRating()).isEqualTo(0.0);
		}

		@Test
		@DisplayName("평점이 없는 코스에서 평점 제거 시 아무 동작 안함")
		void removeRatingFromEmptyCourse() {
			// given
			Course emptyCourse = Course.builder()
				.id(3L)
				.title("빈 코스")
				.region("광주")
				.user(User.builder().id(1L).build())
				.ratingSum(0.0)
				.ratingCount(0)
				.averageRating(0.0)
				.build();
			Double ratingToRemove = 3.0;

			// when
			courseStatisticsService.removeRating(emptyCourse, ratingToRemove);

			// then - 변화 없음
			assertThat(emptyCourse.getRatingSum()).isEqualTo(0.0);
			assertThat(emptyCourse.getRatingCount()).isEqualTo(0);
			assertThat(emptyCourse.getAverageRating()).isEqualTo(0.0);
		}

		@Test
		@DisplayName("음수 방지 테스트 - 제거할 평점이 합계보다 큰 경우")
		void removeRatingPreventNegative() {
			// given
			Course smallSumCourse = Course.builder()
				.id(4L)
				.title("작은 합계 코스")
				.region("대전")
				.user(User.builder().id(1L).build())
				.ratingSum(2.0)
				.ratingCount(1)
				.averageRating(2.0)
				.build();
			Double largeRatingToRemove = 5.0; // 합계보다 큰 값

			// when
			courseStatisticsService.removeRating(smallSumCourse, largeRatingToRemove);

			// then - 음수가 되지 않고 0으로 설정
			assertThat(smallSumCourse.getRatingSum()).isEqualTo(0.0);
			assertThat(smallSumCourse.getRatingCount()).isEqualTo(0);
			assertThat(smallSumCourse.getAverageRating()).isEqualTo(0.0);
		}
	}

	@Nested
	@DisplayName("평점 재계산 테스트")
	class RecalculateCourseRatingTest {

		@Test
		@DisplayName("정확한 값으로 평점 재계산")
		void recalculateRatingWithCorrectValues() {
			// given
			Double correctSum = 12.5;
			Integer correctCount = 3;

			// when
			courseStatisticsService.recalculateRating(realCourse, correctSum, correctCount);

			// then
			assertThat(realCourse.getRatingSum()).isEqualTo(12.5);
			assertThat(realCourse.getRatingCount()).isEqualTo(3);
			assertThat(realCourse.getAverageRating()).isEqualTo(4.2); // 12.5/3 = 4.166... -> 4.2
		}

		@Test
		@DisplayName("평점 개수가 0인 경우 재계산")
		void recalculateRatingWithZeroCount() {
			// given
			Double sum = 0.0;
			Integer count = 0;

			// when
			courseStatisticsService.recalculateRating(realCourse, sum, count);

			// then
			assertThat(realCourse.getRatingSum()).isEqualTo(0.0);
			assertThat(realCourse.getRatingCount()).isEqualTo(0);
			assertThat(realCourse.getAverageRating()).isEqualTo(0.0);
		}
	}

	@Nested
	@DisplayName("일일 인기 점수 계산 테스트")
	class CalculateDailyScoreTest {

		@Test
		@DisplayName("정상적인 일일 점수 계산")
		void calculateDailyScoreNormal() {
			// given - realCourse: 좋아요 15, 조회수 100, 북마크 8, 댓글 5
			// 예상 점수: (15*3) + (100*1) + (8*2) + (5*2) = 45 + 100 + 16 + 10 = 171

			// when
			Integer dailyScore = courseStatisticsService.calculateDailyScore(realCourse);

			// then
			assertThat(dailyScore).isEqualTo(171);
		}

		@Test
		@DisplayName("모든 지표가 0인 경우 일일 점수")
		void calculateDailyScoreAllZero() {
			// given
			Course zeroCourse = Course.builder()
				.id(2L)
				.title("제로 코스")
				.region("제주")
				.user(User.builder().id(1L).build())
				.likeCount(0)
				.viewCount(0)
				.bookmarkCount(0)
				.commentCount(0)
				.build();

			// when
			Integer dailyScore = courseStatisticsService.calculateDailyScore(zeroCourse);

			// then
			assertThat(dailyScore).isEqualTo(0);
		}

		@Test
		@DisplayName("특정 지표만 높은 경우 가중치 반영 확인")
		void calculateDailyScoreWeightTest() {
			// given - 좋아요만 높은 코스 (가중치 3)
			Course likeFocusedCourse = Course.builder()
				.id(3L)
				.title("좋아요 많은 코스")
				.region("경기")
				.user(User.builder().id(1L).build())
				.likeCount(10)    // 10 * 3 = 30
				.viewCount(0)     // 0 * 1 = 0
				.bookmarkCount(0) // 0 * 2 = 0
				.commentCount(0)  // 0 * 2 = 0
				.build();

			// when
			Integer dailyScore = courseStatisticsService.calculateDailyScore(likeFocusedCourse);

			// then
			assertThat(dailyScore).isEqualTo(30); // 좋아요 가중치가 가장 높음을 확인
		}

		@Test
		@DisplayName("매우 큰 수치의 일일 점수 계산")
		void calculateDailyScoreLargeNumbers() {
			// given
			Course popularCourse = Course.builder()
				.id(4L)
				.title("인기 코스")
				.region("서울")
				.user(User.builder().id(1L).build())
				.likeCount(1000)
				.viewCount(10000)
				.bookmarkCount(500)
				.commentCount(200)
				.build();

			// when
			Integer dailyScore = courseStatisticsService.calculateDailyScore(popularCourse);

			// then
			// 예상: (1000*3) + (10000*1) + (500*2) + (200*2) = 3000 + 10000 + 1000 + 400 = 14400
			assertThat(dailyScore).isEqualTo(14400);
		}
	}

	@Nested
	@DisplayName("입력 데이터 유효성 검증 테스트")
	class InputValidationTest {

		@Test
		@DisplayName("null 평점으로 평점 추가 시 예외 발생")
		void addNullRatingThrowsException() {
			// when & then
			assertThatThrownBy(() -> courseStatisticsService.addRating(realCourse, null))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_RATING_VALUE.getMessage());
		}

		@Test
		@DisplayName("범위 밖 평점(0.5)으로 평점 추가 시 예외 발생")
		void addInvalidLowRatingThrowsException() {
			// given
			Double invalidRating = 0.5;

			// when & then
			assertThatThrownBy(() -> courseStatisticsService.addRating(realCourse, invalidRating))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_RATING_VALUE.getMessage());
		}

		@Test
		@DisplayName("범위 밖 평점(5.5)으로 평점 추가 시 예외 발생")
		void addInvalidHighRatingThrowsException() {
			// given
			Double invalidRating = 5.5;

			// when & then
			assertThatThrownBy(() -> courseStatisticsService.addRating(realCourse, invalidRating))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_RATING_VALUE.getMessage());
		}

		@Test
		@DisplayName("null 평점으로 평점 제거 시 예외 발생")
		void removeNullRatingThrowsException() {
			// when & then
			assertThatThrownBy(() -> courseStatisticsService.removeRating(realCourse, null))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_RATING_VALUE.getMessage());
		}

		@Test
		@DisplayName("범위 밖 평점으로 평점 제거 시 예외 발생")
		void removeInvalidRatingThrowsException() {
			// given
			Double invalidRating = 6.0;

			// when & then
			assertThatThrownBy(() -> courseStatisticsService.removeRating(realCourse, invalidRating))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_RATING_VALUE.getMessage());
		}
	}

	@Nested
	@DisplayName("수학적 정확성 검증 테스트")
	class MathematicalAccuracyTest {

		@Test
		@DisplayName("평균 계산 소수점 처리 정확성")
		void averageCalculationDecimalAccuracy() {
			// given - 정확히 1/3이 되는 케이스 (반복 소수)
			Course testCourse = Course.builder()
				.id(5L)
				.title("소수점 테스트")
				.region("울산")
				.user(User.builder().id(1L).build())
				.ratingSum(1.0)
				.ratingCount(3)  // 1.0/3 = 0.333... -> 0.3
				.averageRating(0.0)
				.build();

			// when
			courseStatisticsService.recalculateRating(testCourse, 1.0, 3);

			// then
			assertThat(testCourse.getAverageRating()).isEqualTo(0.3); // 반올림 정확성 확인
		}

		@Test
		@DisplayName("여러 번 평점 추가/제거 후 정확성 유지")
		void multipleOperationsAccuracy() {
			// given
			Course testCourse = Course.builder()
				.id(6L)
				.title("다중 연산 테스트")
				.region("강원")
				.user(User.builder().id(1L).build())
				.ratingSum(0.0)
				.ratingCount(0)
				.averageRating(0.0)
				.build();

			// when - 여러 번 추가 후 제거
			courseStatisticsService.addRating(testCourse, 5.0);     // 5.0/1 = 5.0
			courseStatisticsService.addRating(testCourse, 3.0);     // 8.0/2 = 4.0
			courseStatisticsService.addRating(testCourse, 4.0);     // 12.0/3 = 4.0
			courseStatisticsService.removeRating(testCourse, 3.0);   // 9.0/2 = 4.5

			// then
			assertThat(testCourse.getRatingSum()).isEqualTo(9.0);
			assertThat(testCourse.getRatingCount()).isEqualTo(2);
			assertThat(testCourse.getAverageRating()).isEqualTo(4.5);
		}
	}
}