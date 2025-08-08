import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../api/services/payment.service';
import type { 
  PaymentRequest,
  PaymentDetailResponse,
  RefundRequest
} from '../api/types';

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (orderId: number) => [...paymentKeys.details(), orderId] as const,
};

// 결제 상세 조회
export const usePaymentDetail = (orderId: number) => {
  return useQuery({
    queryKey: paymentKeys.detail(orderId),
    queryFn: () => paymentService.getPaymentDetail(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
  });
};

// 결제 생성
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData: PaymentRequest) => paymentService.createPayment(paymentData),
    onSuccess: (response) => {
      // 결제 상세 캐시에 추가
      queryClient.setQueryData(
        paymentKeys.detail(response.orderId), 
        response
      );
    },
    onError: (error) => {
      console.error('Payment creation failed:', error);
    },
  });
};

// 환불 요청
export const useRequestRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, refundData }: { orderId: number; refundData: RefundRequest }) =>
      paymentService.requestRefund(orderId, refundData),
    onSuccess: (_, { orderId }) => {
      // 해당 결제 상세 정보 다시 조회
      queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(orderId)
      });
    },
    onError: (error) => {
      console.error('Refund request failed:', error);
    },
  });
};

// 결제 검증 (토스페이먼츠 성공 콜백용)
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentKey, orderId, amount }: { 
      paymentKey: string; 
      orderId: string; 
      amount: number; 
    }) => paymentService.verifyPayment(paymentKey, orderId, amount),
    onSuccess: (paymentDetail) => {
      // 검증된 결제 정보를 캐시에 저장
      queryClient.setQueryData(
        paymentKeys.detail(paymentDetail.orderId),
        paymentDetail
      );
    },
    onError: (error) => {
      console.error('Payment verification failed:', error);
    },
  });
};

// 결제 취소 (결제 실패 시)
export const useCancelPayment = () => {
  return useMutation({
    mutationFn: ({ paymentKey, cancelReason }: { 
      paymentKey: string; 
      cancelReason: string; 
    }) => paymentService.cancelPayment(paymentKey, cancelReason),
    onError: (error) => {
      console.error('Payment cancellation failed:', error);
    },
  });
};