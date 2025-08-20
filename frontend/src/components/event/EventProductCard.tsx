import React from 'react';
import { Card, Badge, Button } from '../base';
import type { EventProductListResponseDto } from '../../api/services/eventProduct.service';

interface EventProductCardProps {
  eventProduct: EventProductListResponseDto;
  onPurchase?: (productId: number) => void;
  onViewDetail?: (productId: number) => void;
  className?: string;
}

export const EventProductCard: React.FC<EventProductCardProps> = ({
  eventProduct,
  onPurchase,
  onViewDetail,
  className = ''
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isInStock = eventProduct.stock > 0;

  return (
    <Card className={className}>
      <div className={`${!isInStock ? 'opacity-60' : ''}`}>
        {/* 상품 이미지 */}
        {eventProduct.productImage && (
          <div className="mb-4">
            <img 
              src={eventProduct.productImage} 
              alt={eventProduct.productName}
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {eventProduct.productName}
            </h3>
          </div>
          <div className="ml-3">
            {isInStock ? (
              <Badge variant="success" size="sm">재고 {eventProduct.stock}개</Badge>
            ) : (
              <Badge variant="error" size="sm">품절</Badge>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(eventProduct.price)}원
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>등록일: {formatDate(eventProduct.createdAt)}</span>
        </div>

        <div className="flex space-x-2">
          {onViewDetail && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewDetail(eventProduct.productId);
              }}
              fullWidth
            >
              자세히 보기
            </Button>
          )}
          {onPurchase && isInStock && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPurchase(eventProduct.productId);
              }}
              fullWidth
            >
              구매하기
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};