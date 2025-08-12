package com.example.wherewego.domain.order.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
	Page<Order> findCompletedOrdersByUserId(@Param("userId") Long userId, @Param("status") OrderStatus status,
		Pageable pageable);

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
	Page<Order> findOrdersByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status,
		Pageable pageable);

	/**
	 * 사용자의 특정 주문 상세 조회 (N+1 방지를 위한 JOIN FETCH 사용)
	 * @param orderId 주문 ID
	 * @param userId 사용자 ID
	 * @return 주문 상세 정보
	 */
	@Query("SELECT o FROM Order o JOIN FETCH o.eventProduct WHERE o.id = :orderId AND o.user.id = :userId")
	Optional<Order> findByIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);

	/**
	 * 특정 사용자와 이벤트 상품, 주문 상태 조합으로 주문 존재 여부를 확인합니다.
	 * 주로 '1인당 1개' 제한을 위해 PENDING 상태의 중복 주문을 차단할 때 사용합니다.
	 *
	 * @param userId          사용자 ID (필수)
	 * @param eventProductId  이벤트 상품 ID (필수)
	 * @param status          조회할 주문 상태 (예: PENDING)
	 * @return true  해당 조건의 주문이 존재함
	 *         false 해당 조건의 주문이 존재하지 않음
	 */
	boolean existsByUserIdAndEventProductIdAndStatusIn(Long userId, Long eventProductId,
		Collection<OrderStatus> status);

	/**
	 * 지정한 기준 시각(before) '이전'에 생성된 특정 상태의 주문 목록을 조회합니다.
	 * 스케줄러에서 '5분 이상 미결제(PENDING)' 주문을 정리(삭제/취소)할 때 사용합니다.
	 *
	 * @param status 조회할 주문 상태 (예: PENDING)
	 * @param before 기준 시각(해당 시각 이전에 생성된 주문만 반환, 예: now - 5분)
	 * @return 조건을 만족하는 주문 목록 (없으면 빈 리스트)
	 */
	List<Order> findAllByStatusInAndCreatedAtBefore(Collection<OrderStatus> status, LocalDateTime before);

	/**
	 *
	 *@param orderId       상태를 변경할 주문 ID
	 *@param toStatus      목표 상태
	 *@param fromStatuses  현재 상태가 이 집합에 속할 때만 전이 허용
	 *@return 업데이트 된 행 수
	 */
	@Modifying(clearAutomatically = true)
	@Query("""
		  UPDATE Order o
		     SET o.status = :toStatus
		   WHERE o.id = :orderId
		     AND o.status IN :fromStatuses
		""")
	int updateStatusIfCurrent(Long orderId,
		com.example.wherewego.domain.common.enums.OrderStatus toStatus,
		java.util.Collection<com.example.wherewego.domain.common.enums.OrderStatus> fromStatuses);
}
