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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "payments", 
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_payments_order_no", columnNames = "order_no")
       })
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
	 * 가맹점 주문 번호
	 */
	private String orderNo;

	/**
	 * 토스 payToken
	 */
	private String payToken;

	/**
	 * 토스 transactionId
	 */
	private String transactionId;

	/**
	 * 결제 수단 (CARD, TOSS_MONEY 등)
	 */
	private String payMethod;

	/**
	 * 결제 요청 금액
	 */
	private Integer amount;

	/**
	 * 할인 금액
	 */
	private Integer discountedAmount;

	/**
	 * 실제 결제 승인 금액
	 */
	private Integer paidAmount;

	/**
	 * 결제 완료 시간 (paidTs)
	 */
	private String paidTs;

	// 카드 결제 관련
	private Integer cardCompanyCode;
	private String cardAuthorizationNo;
	private Integer spreadOut;
	private Boolean noInterest;
	private String cardMethodType;
	private String cardNumber;
	private String cardUserType;
	private String cardBinNumber;
	private String cardNum4Print;
	private String salesCheckLinkUrl;

	// 토스머니 등 계좌 결제 관련
	private String accountBankCode;
	private String accountBankName;
	private String accountNumber;

	/**
	 * 결제 상태 (예: PAY_COMPLETE → DONE)
	 */
	@Enumerated(EnumType.STRING)
	private PaymentStatus paymentStatus;

	// ========== 환불 관련 필드 ==========
	
	/**
	 * 환불 사유 (환불 시에만 사용)
	 */
	private String refundReason;
	
	/**
	 * 환불 완료 시간
	 */
	private LocalDateTime refundedAt;
	
	/**
	 * TOSS 환불 거래 키 (환불 완료 시 설정)
	 */
	private String refundTransactionKey;
	
	/**
	 * 환불 요청자 ID (감사용)
	 */
	private Long refundRequestedBy;

	// ========== 비즈니스 메서드 ==========
	
	/**
	 * 결제 토큰 업데이트
	 */
	public void updatePayToken(String payToken) {
		this.payToken = payToken;
	}
	
	/**
	 * 결제 상태 업데이트
	 */
	public void updatePaymentStatus(PaymentStatus paymentStatus) {
		this.paymentStatus = paymentStatus;
	}
	
	/**
	 * 환불 요청 상태로 변경
	 */
	public void requestRefund(String refundReason, Long requestedBy) {
		this.paymentStatus = PaymentStatus.REFUND_REQUESTED;
		this.refundReason = refundReason;
		this.refundRequestedBy = requestedBy;
	}
	
	/**
	 * 환불 처리 완료
	 */
	public void processRefund(String refundReason, Long requestedBy, String transactionKey) {
		this.paymentStatus = PaymentStatus.REFUNDED;
		this.refundReason = refundReason;
		this.refundedAt = LocalDateTime.now();
		this.refundTransactionKey = transactionKey;
		this.refundRequestedBy = requestedBy;
	}
}
