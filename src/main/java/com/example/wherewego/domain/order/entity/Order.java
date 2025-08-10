package com.example.wherewego.domain.order.entity;

import com.example.wherewego.domain.common.entity.BaseEntity;
import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이벤트 핫딜 주문
 */
@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
	name = "orders",
	uniqueConstraints = {
		@UniqueConstraint(
			name = "uk_user_product_status",
			columnNames = {"user_id", "product_id", "status"}
		)
	}
)
public class Order extends BaseEntity {
	/**
	 * 주문 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "order_id")
	private Long id;

	/**
	 * 주문 번호
	 */
	@Column(name = "order_no", nullable = false, unique = true)
	private String orderNo;

	/**
	 * 주문한 사용자
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	/**
	 * 주문한 상품
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id", nullable = false)
	private EventProduct eventProduct;

	/**
	 * 주문 수량
	 */
	@Column(nullable = false)
	private int quantity;

	/**
	 * 총 결제 금액
	 */
	@Column(name = "total_price", nullable = false)
	private int totalPrice;

	/**
	 * 주문 상태 (대기중, 준비완료, 성공, 실패)
	 */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private OrderStatus status = OrderStatus.PENDING;

	public void markAsPaid() {
		this.status = OrderStatus.DONE;
	}

	/**
	 * 주문 상태 업데이트
	 */
	public void updateStatus(OrderStatus status) {
		this.status = status;
	}
}
