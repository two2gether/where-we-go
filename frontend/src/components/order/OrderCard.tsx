import React from 'react';
import { Card, Badge, Button } from '../base';
import { formatDate } from '../../utils/dateUtils';
import type { MyOrderResponseDto } from '../../api/services/order.service';

interface OrderCardProps {
  order: MyOrderResponseDto;
  onViewDetail: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetail,
  onCancel,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'success';
      case 'PENDING':
      case 'READY':
        return 'warning';
      case 'FAILED':
      case 'CANCELED':
        return 'error';
      case 'REFUNDED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '결제 대기중';
      case 'READY':
        return '결제 준비완료';
      case 'DONE':
        return '결제 성공';
      case 'FAILED':
        return '결제 실패';
      case 'REFUNDED':
        return '환불 완료';
      case 'CANCELED':
        return '미결제';
      default:
        return status;
    }
  };


  const formatPrice = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  return (
    <div 
      className={`rounded-lg border transition-all duration-200 hover:shadow-sm ${className}`}
      style={{
        background: 'var(--notion-white)',
        border: '1px solid var(--notion-gray-light)',
        borderRadius: '8px',
        padding: '24px'
      }}
    >
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ 
                color: 'var(--notion-text)',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              {order.productName}
            </h3>
            <div className="space-y-1">
              <p 
                className="text-sm"
                style={{ color: 'var(--notion-text-light)' }}
              >
                주문번호: {order.orderNo}
              </p>
              <p 
                className="text-sm"
                style={{ color: 'var(--notion-text-light)' }}
              >
                주문일: {formatDate(order.orderedAt)}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div 
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: 
                order.status === 'DONE' ? 'var(--notion-green-bg)' :
                (order.status === 'PENDING' || order.status === 'READY') ? 'var(--notion-yellow-bg)' :
                (order.status === 'FAILED' || order.status === 'CANCELED') ? 'var(--notion-red-bg)' :
                'var(--notion-gray-bg)',
              color: 
                order.status === 'DONE' ? 'var(--notion-green)' :
                (order.status === 'PENDING' || order.status === 'READY') ? 'var(--notion-yellow)' :
                (order.status === 'FAILED' || order.status === 'CANCELED') ? 'var(--notion-red)' :
                'var(--notion-text-light)',
              border: '1px solid ' + (
                order.status === 'DONE' ? 'var(--notion-green-light)' :
                (order.status === 'PENDING' || order.status === 'READY') ? 'var(--notion-yellow-light)' :
                (order.status === 'FAILED' || order.status === 'CANCELED') ? 'var(--notion-red-light)' :
                'var(--notion-gray-light)')
            }}
          >
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Divider */}
        <div 
          style={{ 
            height: '1px', 
            backgroundColor: 'var(--notion-gray-light)',
            margin: '8px 0'
          }} 
        />

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p 
              className="text-sm"
              style={{ color: 'var(--notion-text-light)' }}
            >
              수량: {order.quantity}개
            </p>
            <p 
              className="text-lg font-semibold"
              style={{ 
                color: 'var(--notion-text)',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              {formatPrice(order.totalPrice)}원
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetail(order.orderId)}
            >
              상세보기
            </Button>
            {(order.status === 'PENDING' || order.status === 'READY') && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(order.orderId)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                주문취소
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};