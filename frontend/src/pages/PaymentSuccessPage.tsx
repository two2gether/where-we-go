import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GitHubLayout } from '../components/layout/GitHubLayout';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL에서 토스페이먼츠 파라미터 추출 (토스의 실제 콜백 파라미터)
  const status = searchParams.get('status');
  const orderNo = searchParams.get('orderNo');
  const payMethod = searchParams.get('payMethod');
  const bankCode = searchParams.get('bankCode');

  // orderNo로 결제 상세 정보 조회 (토스 결제 검증은 백엔드에서 처리)
  const numericOrderId = orderNo ? parseInt(orderNo.split('-')[0]) || 0 : 0; // orderNo에서 숫자 추출 시도
  
  useEffect(() => {
    // 결제 완료 상태 확인
    if (status === 'PAY_COMPLETE' && orderNo) {
      console.log('토스 결제 성공 콜백:', { status, orderNo, payMethod, bankCode });
      // 백엔드에서 토스 콜백을 통해 결제 상태가 업데이트되어 있어야 함
    } else if (status && status !== 'PAY_COMPLETE') {
      console.error('결제 실패 상태:', status);
    }
  }, [status, orderNo, payMethod, bankCode]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewOrderDetail = () => {
    if (orderNo) {
      // orderNo로부터 실제 주문 ID를 찾아야 하지만, 일단 주문 목록으로 이동
      navigate('/orders');
    }
  };

  // 결제 실패 상태 처리
  if (status && status !== 'PAY_COMPLETE') {
    return (
      <GitHubLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">결제 처리 실패</h1>
            <p className="text-github-neutral-muted mb-6">
              결제 처리에 실패했습니다. 다시 시도해주세요.
            </p>
            <button
              onClick={handleGoHome}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  return (
    <GitHubLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-github-border shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-github-neutral mb-2">결제가 완료되었습니다!</h1>
          <p className="text-github-neutral-muted mb-6">
            결제가 성공적으로 처리되었습니다.
          </p>

          {status === 'PAY_COMPLETE' && orderNo && (
            <div className="bg-github-canvas-subtle rounded-md p-4 mb-6 text-left">
              <h2 className="font-semibold text-github-neutral mb-3">결제 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">주문번호</span>
                  <span className="font-mono text-xs">{orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">결제수단</span>
                  <span>{payMethod || '토스머니'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">상태</span>
                  <span className="text-green-600 font-medium">결제완료</span>
                </div>
                {bankCode && (
                  <div className="flex justify-between">
                    <span className="text-github-neutral-muted">은행코드</span>
                    <span>{bankCode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">결제일시</span>
                  <span>{new Date().toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleViewOrderDetail}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-semibold"
            >
              주문 내역 보기
            </button>
            <button
              onClick={handleGoHome}
              className="w-full px-6 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </GitHubLayout>
  );
};

export default PaymentSuccessPage;