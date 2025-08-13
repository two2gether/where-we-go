package com.example.wherewego.domain.payment.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.wherewego.domain.common.enums.PaymentStatus;
import com.example.wherewego.domain.payment.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
	boolean existsByOrderNo(String orderNo);

	/**
	 * 특정 주문의 결제 정보를 조회합니다. (주문 정보와 함께 JOIN FETCH)
	 * @param orderId 주문 ID
	 * @return 결제 정보 (Optional)
	 */
	@Query("SELECT p FROM Payment p JOIN FETCH p.order WHERE p.order.id = :orderId")
	Optional<Payment> findByOrderIdWithOrder(@Param("orderId") Long orderId);

	/**
	 * 특정 주문의 결제 정보를 본인 확인과 함께 조회합니다.
	 * @param orderId 주문 ID  
	 * @param userId 사용자 ID (본인 확인용)
	 * @return 결제 정보 (Optional)
	 */
	@Query("SELECT p FROM Payment p JOIN FETCH p.order WHERE p.order.id = :orderId AND p.order.user.id = :userId")
	Optional<Payment> findByOrderIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);

	/**
	 * 해당 주문의 결제가 아직 진행 중(예: PENDING/READY)이면 만료로 마킹
	 * 해당 주문의 결제가 아직 진행 중(READY)이면 EXPIRED 로 마킹합니다.
	 */
	@Modifying(clearAutomatically = true)
	@Query("""
		    UPDATE Payment p
		       SET p.paymentStatus = com.example.wherewego.domain.common.enums.PaymentStatus.EXPIRED
		     WHERE p.order.id = :orderId
		       AND p.paymentStatus = com.example.wherewego.domain.common.enums.PaymentStatus.READY
		""")
	int markExpiredIfReady(@Param("orderId") Long orderId);

	boolean existsByOrderNoAndPaymentStatus(String orderNo, PaymentStatus paymentStatus);

	/**
	 * 환불 요청을 원자적으로 처리합니다.
	 * DONE 상태인 결제건만 REFUND_REQUESTED로 변경하여 동시성 문제를 해결합니다.
	 *
	 * @param orderId 주문 ID
	 * @param userId 사용자 ID (본인 확인용)
	 * @param refundReason 환불 사유
	 * @return 업데이트된 행 수 (1이면 성공, 0이면 실패)
	 */
	@Modifying(clearAutomatically = true)
	@Query("""
		UPDATE Payment p 
		SET p.paymentStatus = com.example.wherewego.domain.common.enums.PaymentStatus.REFUND_REQUESTED,
		    p.refundReason = :refundReason,
		    p.refundRequestedBy = :userId,
		    p.updatedAt = CURRENT_TIMESTAMP
		WHERE p.order.id = :orderId 
		  AND p.paymentStatus = com.example.wherewego.domain.common.enums.PaymentStatus.DONE
		  AND p.order.user.id = :userId
		  AND p.createdAt >= :sevenDaysAgo
		""")
	int requestRefundAtomically(@Param("orderId") Long orderId,
		@Param("userId") Long userId,
		@Param("refundReason") String refundReason,
		@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);
}
