package com.example.wherewego.domain.payment.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
