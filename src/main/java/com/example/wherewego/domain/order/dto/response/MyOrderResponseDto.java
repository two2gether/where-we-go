package com.example.wherewego.domain.order.dto.response;

import com.example.wherewego.domain.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 내 주문 목록 조회 응답 DTO
 * 결제 완료된 주문만 반환하는 API에서 사용
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyOrderResponseDto {
    
    /**
     * 주문 ID
     */
    private Long orderId;
    
    /**
     * 주문 번호
     */
    private String orderNo;
    
    /**
     * 상품명
     */
    private String productName;
    
    /**
     * 상품 이미지
     */
    private String productImage;
    
    /**
     * 주문 수량
     */
    private int quantity;
    
    /**
     * 총 결제 금액
     */
    private int totalPrice;
    
    /**
     * 주문 상태
     */
    private OrderStatus status;
    
    /**
     * 주문 생성일시
     */
    private LocalDateTime createdAt;
}