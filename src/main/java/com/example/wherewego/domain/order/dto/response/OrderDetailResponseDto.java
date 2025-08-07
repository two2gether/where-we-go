package com.example.wherewego.domain.order.dto.response;

import com.example.wherewego.domain.common.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 주문 상세 조회 응답 DTO
 * 상품 정보가 중첩된 구조로 포함됨
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponseDto {
    
    /**
     * 주문 ID
     */
    private Long orderId;
    
    /**
     * 주문 번호
     */
    private String orderNo;
    
    /**
     * 상품 정보 (중첩 DTO)
     */
    private ProductInfo product;
    
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
     * 주문일시
     */
    private LocalDateTime orderedAt;
    
    /**
     * 주문 수정일시
     */
    private LocalDateTime updatedAt;
    
    /**
     * 상품 정보 중첩 DTO
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        
        /**
         * 상품 ID
         */
        private Long productId;
        
        /**
         * 상품명
         */
        private String productName;
        
        /**
         * 상품 이미지
         */
        private String productImage;
        
        /**
         * 상품 설명
         */
        private String description;
        
        /**
         * 상품 단가
         */
        private int price;
    }
}