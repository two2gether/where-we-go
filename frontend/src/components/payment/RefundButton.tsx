import React, { useState } from 'react';
import { useRequestRefund, usePaymentDetail } from '../../hooks/usePayments';
import { Button } from '../base';
import type { RefundRequest } from '../../api/types';

interface RefundButtonProps {
  orderId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'solid';
  onRefundSuccess?: () => void;
}

export const RefundButton: React.FC<RefundButtonProps> = ({
  orderId,
  className = '',
  size = 'sm',
  variant = 'outline',
  onRefundSuccess
}) => {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const { data: paymentDetail } = usePaymentDetail(orderId);
  const requestRefundMutation = useRequestRefund();

  // 환불 가능 여부 확인
  const isRefundable = paymentDetail?.data?.refundable === true && 
                      paymentDetail?.data?.paymentStatus === 'DONE';

  const handleRefundRequest = async () => {
    if (!refundReason.trim()) {
      alert('환불 사유를 입력해주세요.');
      return;
    }

    const refundData: RefundRequest = {
      refundReason: refundReason.trim(),
    };

    try {
      await requestRefundMutation.mutateAsync({
        orderId,
        refundData,
      });
      alert('환불 요청이 성공적으로 접수되었습니다.');
      setShowRefundModal(false);
      setRefundReason('');
      onRefundSuccess?.();
    } catch (error) {
      console.error('환불 요청 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`환불 요청에 실패했습니다: ${errorMessage}`);
    }
  };

  // 환불 불가능한 경우 버튼을 표시하지 않음
  if (!isRefundable) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowRefundModal(true)}
        className={`text-red-600 border-red-300 hover:bg-red-50 ${className}`}
      >
        환불 요청
      </Button>

      {/* 환불 요청 모달 */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">환불 요청</h3>
            
            {/* 환불 안내 */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">환불 안내</p>
                  <ul className="text-xs space-y-1">
                    <li>• 결제 완료 후 7일 이내에만 환불 가능합니다</li>
                    <li>• 환불 처리는 영업일 기준 3-5일 소요됩니다</li>
                    <li>• 결제 수단과 동일한 방법으로 환불됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 사유 *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="환불 사유를 상세히 입력해주세요"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {refundReason.length}/500자
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundReason('');
                }}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="solid"
                size="md"
                onClick={handleRefundRequest}
                disabled={requestRefundMutation.isPending || !refundReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {requestRefundMutation.isPending ? '요청 중...' : '환불 요청'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};