package com.example.wherewego.domain.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 토스 결제 승인 요청 DTO
 * 토스 결제를 승인할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallbackRequestDto {
	/**
	 * 결제 상태 (PAY_COMPLETE만 전달됨)
	 */
	private String status;

	/**
	 * 토스 payToken
	 */
	private String payToken;

	/**
	 * 가맹점 주문 번호
	 */
	private String orderNo;

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

	/**
	 * 토스 transactionId
	 */
	private String transactionId;

	// 카드 정보 (CARD인 경우)
	private Integer cardCompanyCode;
	private String cardAuthorizationNo;
	private Integer spreadOut;
	private Boolean noInterest;
	private String cardMethodType;
	private String cardUserType;
	private String cardNumber;
	private String cardBinNumber;
	private String cardNum4Print;
	private String salesCheckLinkUrl;

	// 계좌 정보 (TOSS_MONEY인 경우)
	private String accountBankCode;
	private String accountBankName;
	private String accountNumber;
}
