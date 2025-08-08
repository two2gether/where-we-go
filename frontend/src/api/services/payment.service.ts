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
  createPayment: (paymentData: PaymentRequest): Promise<PaymentResponse> =>
    apiRequest.post<PaymentResponse>('/payments', paymentData)
      .then(response => response.data),

  // 결제 상세 조회
  getPaymentDetail: (orderId: number): Promise<PaymentDetailResponse> =>
    apiRequest.get<PaymentDetailResponse>(`/payments/${orderId}`)
      .then(response => response.data),

  // 환불 요청
  requestRefund: (orderId: number, refundData: RefundRequest): Promise<RefundResponse> =>
    apiRequest.post<RefundResponse>(`/payments/${orderId}/refund`, refundData)
      .then(response => response.data),

  // 결제 검증 (결제 성공 후 서버 검증)
  verifyPayment: (paymentKey: string, orderId: string, amount: number): Promise<PaymentDetailResponse> =>
    apiRequest.post<PaymentDetailResponse>('/payments/verify', {
      paymentKey,
      orderId,
      amount
    }).then(response => response.data),

  // 결제 취소 (결제 실패 시)
  cancelPayment: (paymentKey: string, cancelReason: string): Promise<void> =>
    apiRequest.post<void>('/payments/cancel', {
      paymentKey,
      cancelReason
    }).then(response => response.data),
};