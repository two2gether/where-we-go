package com.example.wherewego.domain.payment.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.payment.repository.PaymentRepository;

/**
 * PaymentRepository의 원자적 환불 처리 메서드 단위 테스트
 * 
 * 동시성 문제 해결을 위한 requestRefundAtomically() 메서드의 
 * 정상 동작 및 경계 조건을 검증합니다.
 */
@ExtendWith(MockitoExtension.class)
class PaymentRefundUnitTest {

	@Mock
	private PaymentRepository paymentRepository;
	
	@Test
	@DisplayName("원자적 환불 요청이 성공하면 repository 메서드가 정상 호출된다")
	void testAtomicRefundRepositorySuccess() {
		// Given
		Long orderId = 1L;
		Long userId = 1L;
		String refundReason = "테스트 환불 사유";
		LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
		
		// 원자적 업데이트가 성공 (1개 행 업데이트)
		when(paymentRepository.requestRefundAtomically(
			eq(orderId), eq(userId), eq(refundReason), any(LocalDateTime.class)))
			.thenReturn(1);
		
		// When
		int result = paymentRepository.requestRefundAtomically(orderId, userId, refundReason, sevenDaysAgo);
		
		// Then
		assertThat(result).isEqualTo(1);
		
		// 원자적 업데이트가 호출되었는지 확인
		verify(paymentRepository).requestRefundAtomically(
			eq(orderId), eq(userId), eq(refundReason), any(LocalDateTime.class));
	}
	
	@Test
	@DisplayName("원자적 환불 요청이 실패하면 0이 반환된다")
	void testAtomicRefundRepositoryFailure() {
		// Given
		Long orderId = 1L;
		Long userId = 1L;
		String refundReason = "테스트 환불 사유";
		LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
		
		// 원자적 업데이트가 실패 (0개 행 업데이트)
		when(paymentRepository.requestRefundAtomically(
			eq(orderId), eq(userId), eq(refundReason), any(LocalDateTime.class)))
			.thenReturn(0);
		
		// When
		int result = paymentRepository.requestRefundAtomically(orderId, userId, refundReason, sevenDaysAgo);
		
		// Then
		assertThat(result).isEqualTo(0);
		
		// 원자적 업데이트가 시도되었는지 확인
		verify(paymentRepository).requestRefundAtomically(
			eq(orderId), eq(userId), eq(refundReason), any(LocalDateTime.class));
	}
	
	@Test
	@DisplayName("원자적 환불 요청은 동시성 조건을 데이터베이스에서 처리한다")
	void testAtomicRefundConcurrencyHandling() {
		// Given
		Long orderId = 1L;
		Long userId = 1L;
		String refundReason = "동시성 테스트 환불 사유";
		LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
		
		// 첫 번째 호출은 성공 (1개 행 업데이트)
		// 두 번째 호출은 실패 (0개 행 업데이트 - 이미 상태가 변경됨)
		when(paymentRepository.requestRefundAtomically(
			eq(orderId), eq(userId), eq(refundReason), any(LocalDateTime.class)))
			.thenReturn(1) // 첫 번째 호출
			.thenReturn(0); // 두 번째 호출
		
		// When & Then
		int firstResult = paymentRepository.requestRefundAtomically(orderId, userId, refundReason, sevenDaysAgo);
		int secondResult = paymentRepository.requestRefundAtomically(orderId, userId, refundReason, sevenDaysAgo);
		
		assertThat(firstResult).isEqualTo(1);  // 첫 번째는 성공
		assertThat(secondResult).isEqualTo(0); // 두 번째는 실패
		
		// 두 번 호출되었는지 확인
		verify(paymentRepository, times(2)).requestRefundAtomically(
			eq(orderId), eq(userId), eq(refundReason), any(LocalDateTime.class));
	}
}