package com.example.wherewego.domain.payment.dto.response;

import java.time.LocalDateTime;

import com.example.wherewego.domain.common.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 결제 상세 정보 응답 DTO
 * 프론트엔드에서 결제 상세 페이지에 사용되는 데이터 구조
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentDetailResponseDto {

    /**
     * 결제 ID
     */
    private Long paymentId;

    /**
     * 주문 ID
     */
    private Long orderId;

    /**
     * 주문번호
     */
    private String orderNo;

    /**
     * 결제 수단 (CARD, TOSS_MONEY, ACCOUNT)
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
     * 결제 완료 시간
     */
    private String paidTs;

    /**
     * 결제 상태
     */
    private PaymentStatus paymentStatus;

    /**
     * 토스 거래 ID (환불 시 필요)
     */
    private String transactionId;

    /**
     * 카드 결제 정보 (카드 결제 시에만)
     */
    private CardInfo cardInfo;

    /**
     * 계좌 결제 정보 (계좌 결제 시에만)
     */
    private AccountInfo accountInfo;

    /**
     * 카드 결제 상세 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardInfo {
        /**
         * 카드번호 (마스킹 처리)
         */
        private String cardNumber;

        /**
         * 카드사 코드
         */
        private Integer cardCompanyCode;

        /**
         * 카드 승인번호
         */
        private String cardAuthorizationNo;

        /**
         * 할부 개월 (일시불: 0)
         */
        private Integer spreadOut;

        /**
         * 무이자 여부
         */
        private Boolean noInterest;

        /**
         * 카드 결제 방식
         */
        private String cardMethodType;

        /**
         * 마지막 4자리 (표시용)
         */
        private String cardNum4Print;

        /**
         * 전표 확인 URL
         */
        private String salesCheckLinkUrl;
    }

    /**
     * 계좌 결제 상세 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountInfo {
        /**
         * 은행 코드
         */
        private String accountBankCode;

        /**
         * 은행명
         */
        private String accountBankName;

        /**
         * 계좌번호 (마스킹 처리)
         */
        private String accountNumber;
    }
}