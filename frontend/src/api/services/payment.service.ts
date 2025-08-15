import { apiRequest } from '../axios';
import type { 
  PaymentRequest,
  PaymentResponse,
  PaymentDetailResponse,
  RefundRequest,
  RefundResponse
} from '../types';

export const paymentService = {
  // 결제 생성
  createPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    console.log('Payment service - 요청 데이터:', paymentData);
    try {
      const response = await apiRequest.post<PaymentResponse>('/payments', paymentData);
      console.log('Payment service - 응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('Payment service - API 호출 실패:', error);
      throw error;
    }
  },

  // 결제 상세 조회
  getPaymentDetail: (orderId: number): Promise<PaymentDetailResponse> =>
    apiRequest.get<PaymentDetailResponse>(`/payments/${orderId}`)
      .then(response => response.data),

  // 환불 요청
  requestRefund: (orderId: number, refundData: RefundRequest): Promise<RefundResponse> =>
    apiRequest.post<RefundResponse>(`/payments/${orderId}/refund`, refundData)
      .then(response => response.data),

  // TODO: 백엔드에서 결제 검증/취소 API 구현 후 활성화
  // verifyPayment: (paymentKey: string, orderId: string, amount: number): Promise<PaymentDetailResponse> =>
  //   apiRequest.post<PaymentDetailResponse>('/payments/verify', {
  //     paymentKey,
  //     orderId,
  //     amount
  //   }).then(response => response.data),

  // cancelPayment: (paymentKey: string, cancelReason: string): Promise<void> =>
  //   apiRequest.post<void>('/payments/cancel', {
  //     paymentKey,
  //     cancelReason
  //   }).then(response => response.data),
};