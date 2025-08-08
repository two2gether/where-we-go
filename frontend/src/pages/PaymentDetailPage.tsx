import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePaymentDetail, useRequestRefund } from '../hooks/usePayments';
import { GitHubLayout } from '../components/layout/GitHubLayout';
import type { RefundRequest } from '../api/types';

const PaymentDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const { data: paymentDetail, isLoading, error } = usePaymentDetail(Number(orderId));
  const requestRefundMutation = useRequestRefund();

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
        orderId: Number(orderId),
        refundData,
      });
      alert('환불 요청이 성공적으로 접수되었습니다.');
      setShowRefundModal(false);
      setRefundReason('');
    } catch (error) {
      console.error('환불 요청 실패:', error);
      alert('환불 요청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (isLoading) {
    return (
      <GitHubLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg border border-github-border p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  if (error || !paymentDetail) {
    return (
      <GitHubLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">결제 정보를 찾을 수 없습니다</h1>
            <p className="text-github-neutral-muted mb-6">
              요청하신 결제 정보가 존재하지 않거나 접근 권한이 없습니다.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              이전으로
            </button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      case 'REFUNDED': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DONE': return '결제완료';
      case 'PENDING': return '결제대기';
      case 'FAILED': return '결제실패';
      case 'CANCELLED': return '결제취소';
      case 'REFUNDED': return '환불완료';
      default: return status;
    }
  };

  return (
    <GitHubLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-github-neutral-muted hover:text-github-neutral mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로
          </button>
          <h1 className="text-2xl font-bold text-github-neutral">결제 상세</h1>
        </div>

        <div className="bg-white rounded-lg border border-github-border shadow-sm">
          <div className="border-b border-github-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-github-neutral">주문번호: {paymentDetail.orderNo}</h2>
                <p className="text-github-neutral-muted mt-1">
                  결제일시: {new Date(paymentDetail.paidTs).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentDetail.paymentStatus)}`}>
                {getStatusText(paymentDetail.paymentStatus)}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 결제 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-github-neutral mb-4">결제 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-github-neutral-muted">결제수단</span>
                    <span className="font-medium">{paymentDetail.payMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-github-neutral-muted">주문금액</span>
                    <span>{paymentDetail.amount.toLocaleString()}원</span>
                  </div>
                  {paymentDetail.discountedAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-github-neutral-muted">할인금액</span>
                      <span className="text-red-600">-{paymentDetail.discountedAmount.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold">
                    <span>결제금액</span>
                    <span className="text-primary-600">{paymentDetail.paidAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-github-neutral-muted">거래번호</span>
                    <span className="font-mono text-sm">{paymentDetail.transactionId}</span>
                  </div>
                </div>
              </div>

              {/* 결제수단별 상세정보 */}
              <div>
                <h3 className="text-lg font-semibold text-github-neutral mb-4">결제수단 상세</h3>
                
                {paymentDetail.cardInfo && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-github-neutral-muted">카드번호</span>
                      <span className="font-mono">{paymentDetail.cardInfo.cardNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-github-neutral-muted">승인번호</span>
                      <span className="font-mono">{paymentDetail.cardInfo.cardAuthorizationNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-github-neutral-muted">할부개월</span>
                      <span>{paymentDetail.cardInfo.spreadOut === 0 ? '일시불' : `${paymentDetail.cardInfo.spreadOut}개월`}</span>
                    </div>
                    {paymentDetail.cardInfo.salesCheckLinkUrl && (
                      <div className="pt-2">
                        <a
                          href={paymentDetail.cardInfo.salesCheckLinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 underline text-sm"
                        >
                          매출전표 확인
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {paymentDetail.accountInfo && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-github-neutral-muted">은행</span>
                      <span>{paymentDetail.accountInfo.accountBankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-github-neutral-muted">계좌번호</span>
                      <span className="font-mono">{paymentDetail.accountInfo.accountNumber}</span>
                    </div>
                  </div>
                )}

                {paymentDetail.payMethod === 'TOSS_MONEY' && (
                  <div className="text-github-neutral-muted">
                    토스머니로 결제되었습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 환불 요청 버튼 */}
            {paymentDetail.paymentStatus === 'DONE' && (
              <div className="mt-8 pt-6 border-t border-github-border">
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="px-6 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                >
                  환불 요청
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 환불 요청 모달 */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-github-neutral mb-4">환불 요청</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-github-neutral mb-2">
                  환불 사유
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-github-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="환불 사유를 입력해주세요"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
                >
                  취소
                </button>
                <button
                  onClick={handleRefundRequest}
                  disabled={requestRefundMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {requestRefundMutation.isPending ? '요청 중...' : '환불 요청'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GitHubLayout>
  );
};

export default PaymentDetailPage;