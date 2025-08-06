package com.example.wherewego.domain.payment.mapper;

import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.payment.dto.request.CallbackRequestDto;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.payment.entity.Payment;

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

			.orderStatus(OrderStatus.DONE) // 결제 완료로 고정
			.build();
	}

	public static OrderCreateRequestDto toOrderCreateRequestDto(PaymentRequestDto dto) {
		return OrderCreateRequestDto.builder()
			.productId(dto.getProductId())
			.quantity(dto.getAmount())
			.build();
	}
}
