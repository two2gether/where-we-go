package com.example.wherewego.domain.payment.entity;

import java.time.LocalDateTime;

import com.example.wherewego.domain.common.entity.BaseEntity;
import com.example.wherewego.domain.common.enums.PaymentStatus;
import com.example.wherewego.domain.order.entity.Order;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "payments")
public class Payment extends BaseEntity {

	/**
	 * 결제 고유 ID
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "payments_id")
	private Long id;

	/**
	 * 연결된(결제할) 주문
	 */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "order_id", nullable = false, unique = true)
	private Order order;

	/**
	 * 결제 수단
	 */
	@Column(length = 50, nullable = false)
	private String method;

	/**
	 * PG사에서 받은 고유 결제키
	 */
	@Column(name = "payment_key", length = 255, nullable = false)
	private String paymentKey;

	/**
	 * 결제 상태 (준비, 완료, 실패)
	 */
	@Enumerated(EnumType.STRING)
	@Column(length = 30, nullable = false)
	private PaymentStatus paymentStatus;

	/**
	 * 결제 완료 시각
	 */
	@Column(name = "paid_at", nullable = false)
	private LocalDateTime paidAt;
}
