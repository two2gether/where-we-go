package com.example.wherewego.domain.order.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.order.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
	Optional<Order> findByOrderNo(String orderNo);
	
	/**
	 * 사용자의 완료된 주문 목록 조회 (N+1 방지를 위한 JOIN FETCH 사용)
	 * @param userId 사용자 ID
	 * @param status 주문 상태 (DONE: 결제 성공)
	 * @param pageable 페이징 정보
	 * @return 결제 완료된 주문 목록
	 */
	@Query("SELECT o FROM Order o JOIN FETCH o.eventProduct WHERE o.user.id = :userId AND o.status = :status ORDER BY o.createdAt DESC")
	Page<Order> findCompletedOrdersByUserId(@Param("userId") Long userId, @Param("status") OrderStatus status, Pageable pageable);
	
	/**
	 * 사용자의 모든 주문 목록 조회 (N+1 방지를 위한 JOIN FETCH 사용)
	 * @param userId 사용자 ID
	 * @param pageable 페이징 정보
	 * @return 모든 상태의 주문 목록
	 */
	@Query("SELECT o FROM Order o JOIN FETCH o.eventProduct WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
	Page<Order> findOrdersByUserId(@Param("userId") Long userId, Pageable pageable);
	
	/**
	 * 사용자의 특정 상태 주문 목록 조회 (N+1 방지를 위한 JOIN FETCH 사용)
	 * @param userId 사용자 ID
	 * @param status 주문 상태
	 * @param pageable 페이징 정보
	 * @return 특정 상태의 주문 목록
	 */
	@Query("SELECT o FROM Order o JOIN FETCH o.eventProduct WHERE o.user.id = :userId AND o.status = :status ORDER BY o.createdAt DESC")
	Page<Order> findOrdersByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status, Pageable pageable);
	
	/**
	 * 사용자의 특정 주문 상세 조회 (N+1 방지를 위한 JOIN FETCH 사용)
	 * @param orderId 주문 ID
	 * @param userId 사용자 ID
	 * @return 주문 상세 정보
	 */
	@Query("SELECT o FROM Order o JOIN FETCH o.eventProduct WHERE o.id = :orderId AND o.user.id = :userId")
	Optional<Order> findByIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);
}
