import { api } from '../axios';
import type { ApiResponse, PagedResponse } from '../types';

// 이벤트 상품 목록 응답 DTO (백엔드 EventListResponseDto와 매칭)
export interface EventProductListResponseDto {
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  stock: number;
  createdAt: string;
}

// 이벤트 상품 상세 응답 DTO (백엔드 EventDetailResponseDto와 매칭)
export interface EventProductDetailResponseDto {
  productId: number;
  productName: string;
  productImage?: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
}

// 이벤트 상품 생성 요청 DTO
export interface EventProductCreateRequestDto {
  productName: string;
  productImage?: string;
  description: string;
  price: number;
  stock: number;
}

// 이벤트 상품 수정 요청 DTO (백엔드 EventUpdateRequestDto와 매칭)
export interface EventProductUpdateRequestDto {
  productName: string;
  productImage?: string;
  description: string;
  price: number;
  stock: number;
}

export const eventProductService = {
  // 활성화된 이벤트 상품 목록 조회 (백엔드 /api/event-products GET)
  getActiveEventProducts: async (page = 0, size = 10): Promise<ApiResponse<PagedResponse<EventProductListResponseDto>>> => {
    const response = await api.get('/event-products', {
      params: { page, size }
    });
    return response.data;
  },

  // 이벤트 상품 상세 조회 (백엔드 /api/event-products/{productId} GET)
  getEventProductDetail: async (productId: number): Promise<ApiResponse<EventProductDetailResponseDto>> => {
    const response = await api.get(`/event-products/${productId}`);
    return response.data;
  }
};

// 관리자 전용 이벤트 상품 API (실제 백엔드 API 엔드포인트와 매칭)
export const adminEventProductService = {
  // 이벤트 상품 생성 (백엔드 /api/admin/event-products POST)
  createEventProduct: async (data: EventProductCreateRequestDto): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/event-products', data);
    return response.data;
  },

  // 이벤트 상품 수정 (백엔드 /api/admin/event-products/{productId} PATCH)
  updateEventProduct: async (productId: number, data: EventProductUpdateRequestDto): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/admin/event-products/${productId}`, data);
    return response.data;
  },

  // 이벤트 상품 삭제 (백엔드 /api/admin/event-products/{productId} DELETE)
  deleteEventProduct: async (productId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/admin/event-products/${productId}`);
    return response.data;
  }
};