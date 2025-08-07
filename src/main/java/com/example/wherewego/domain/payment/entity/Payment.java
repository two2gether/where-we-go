package com.example.wherewego.domain.payment.entity;

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

	/**
	 * 업데이트 토큰
	 */
	public void updatePayToken(String payToken) {
		this.payToken = payToken;
	}
}
