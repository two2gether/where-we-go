package com.example.wherewego.domain.payment.mapper;

import com.example.wherewego.domain.common.enums.PaymentStatus;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.payment.dto.request.CallbackRequestDto;
import com.example.wherewego.domain.payment.dto.response.PaymentDetailResponseDto;
import com.example.wherewego.domain.payment.entity.Payment;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PaymentMapper {

	// 결제 응답 콜백 DTO → 결제 엔티티
	public static Payment toEntity(CallbackRequestDto dto, Order order) {
		return Payment.builder()
			.order(order)  // 반드시 전달
			.orderNo(dto.getOrderNo())
			.transactionId(dto.getTransactionId())
			.payToken(dto.getPayToken())
			.payMethod(dto.getPayMethod())
			.amount(dto.getAmount())
			.discountedAmount(dto.getDiscountedAmount())
			.paidAmount(dto.getPaidAmount())
			.paidTs(dto.getPaidTs())

			// 카드 관련
			.cardCompanyCode(dto.getCardCompanyCode())
			.cardAuthorizationNo(dto.getCardAuthorizationNo())
			.spreadOut(dto.getSpreadOut())
			.noInterest(dto.getNoInterest())
			.cardMethodType(dto.getCardMethodType())
			.cardNumber(dto.getCardNumber())
			.cardUserType(dto.getCardUserType())
			.cardBinNumber(dto.getCardBinNumber())
			.cardNum4Print(dto.getCardNum4Print())
			.salesCheckLinkUrl(dto.getSalesCheckLinkUrl())

			// 계좌 관련
			.accountBankCode(dto.getAccountBankCode())
			.accountBankName(dto.getAccountBankName())
			.accountNumber(dto.getAccountNumber())

			.paymentStatus(PaymentStatus.DONE)
			.build();
	}

	/**
	 * Payment 엔티티를 PaymentDetailResponseDto로 변환합니다.
	 * 민감정보는 마스킹 처리됩니다.
	 *
	 * @param payment 결제 엔티티 (Order 정보 포함)
	 * @return 결제 상세 응답 DTO
	 */
	public static PaymentDetailResponseDto toPaymentDetailDto(Payment payment) {
		PaymentDetailResponseDto.PaymentDetailResponseDtoBuilder builder = PaymentDetailResponseDto.builder()
			.paymentId(payment.getId())
			.orderId(payment.getOrder().getId())
			.orderNo(payment.getOrderNo())
			.payMethod(payment.getPayMethod())
			.amount(payment.getAmount())
			.discountedAmount(payment.getDiscountedAmount())
			.paidAmount(payment.getPaidAmount())
			.paidTs(payment.getPaidTs())
			.paymentStatus(payment.getPaymentStatus())
			.transactionId(payment.getTransactionId());

		// 결제 방법별 상세 정보 추가
		if ("CARD".equals(payment.getPayMethod()) && payment.getCardNumber() != null) {
			builder.cardInfo(PaymentDetailResponseDto.CardInfo.builder()
				.cardNumber(maskCardNumber(payment.getCardNumber()))
				.cardCompanyCode(payment.getCardCompanyCode())
				.cardAuthorizationNo(payment.getCardAuthorizationNo())
				.spreadOut(payment.getSpreadOut())
				.noInterest(payment.getNoInterest())
				.cardMethodType(payment.getCardMethodType())
				.cardNum4Print(payment.getCardNum4Print())
				.salesCheckLinkUrl(payment.getSalesCheckLinkUrl())
				.build());
		}

		if ("ACCOUNT".equals(payment.getPayMethod()) && payment.getAccountNumber() != null) {
			builder.accountInfo(PaymentDetailResponseDto.AccountInfo.builder()
				.accountBankCode(payment.getAccountBankCode())
				.accountBankName(payment.getAccountBankName())
				.accountNumber(maskAccountNumber(payment.getAccountNumber()))
				.build());
		}

		return builder.build();
	}

	/**
	 * 카드번호 마스킹 처리
	 * 예: 1234567812345678 → **** **** **** 5678
	 */
	private static String maskCardNumber(String cardNumber) {
		if (cardNumber == null || cardNumber.length() < 4) {
			return cardNumber;
		}

		String last4 = cardNumber.substring(cardNumber.length() - 4);
		return "**** **** **** " + last4;
	}

	/**
	 * 계좌번호 마스킹 처리  
	 * 예: 352-0815-2468-01 → 352-****-****-01
	 */
	private static String maskAccountNumber(String accountNumber) {
		if (accountNumber == null || accountNumber.length() < 6) {
			return accountNumber;
		}

		// 하이픈이 있는 경우와 없는 경우 처리
		if (accountNumber.contains("-")) {
			String[] parts = accountNumber.split("-");
			if (parts.length >= 3) {
				return parts[0] + "-****-****-" + parts[parts.length - 1];
			}
		} else {
			// 하이픈 없는 경우: 앞 3자리 + **** + 뒤 2자리
			if (accountNumber.length() > 5) {
				String prefix = accountNumber.substring(0, 3);
				String suffix = accountNumber.substring(accountNumber.length() - 2);
				return prefix + "****" + suffix;
			}
		}

		return accountNumber;
	}
}
