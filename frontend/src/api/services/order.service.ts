import { api } from '../axios';
import type { ApiResponse, PagedResponse } from '../types';

// 주문 생성 요청 DTO
export interface OrderCreateRequestDto {
  productId: number;  // EventProduct ID
  quantity: number;
}

// 주문 생성 응답 DTO (백엔드 OrderCreateResponseDto와 매칭)
export interface OrderCreateResponseDto {
  orderId: number;
  orderNo: string;
}

// 주문 상태 타입 (백엔드 OrderStatus enum과 매칭)
export type OrderStatus = 'PENDING' | 'READY' | 'DONE' | 'FAILED' | 'REFUNDED';

// 내 주문 응답 DTO (백엔드 MyOrderResponseDto와 매칭)
export interface MyOrderResponseDto {
  orderId: number;
  orderNo: string;
  productName: string;
  productImage?: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  orderedAt: string;
}

// 주문 상세 응답 DTO (백엔드 OrderDetailResponseDto와 매칭)
export interface OrderDetailResponseDto {
  orderId: number;
  orderNo: string;
  product: {
    productId: number;
    productName: string;
    productImage?: string;
    description: string;
    price: number;
  };
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  orderedAt: string;
  updatedAt: string;
}

export const orderService = {
  // 주문 생성
  createOrder: async (data: OrderCreateRequestDto): Promise<ApiResponse<OrderCreateResponseDto>> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // 내 주문 목록 조회
  getMyOrders: async (page = 0, size = 10): Promise<ApiResponse<PagedResponse<MyOrderResponseDto>>> => {
    const response = await api.get('/orders/mypage', {
      params: { page, size }
    });
    return response.data;
  },

  // 주문 상세 조회
  getOrderDetail: async (orderId: number): Promise<ApiResponse<OrderDetailResponseDto>> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // 주문 삭제
  deleteOrder: async (orderId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  }
};