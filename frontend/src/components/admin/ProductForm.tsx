import React, { useState } from 'react';
import { Button, Input, Card, ImageUpload } from '../base';
import type { EventProductCreateRequestDto, EventProductUpdateRequestDto } from '../../api/services/eventProduct.service';

interface ProductFormProps {
  initialData?: {
    productId?: number;
    productName: string;
    productImage?: string;
    description: string;
    price: number;
    stock: number;
  };
  onSubmit: (data: EventProductCreateRequestDto | EventProductUpdateRequestDto, imageFile?: File) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const [formData, setFormData] = useState({
    productName: initialData?.productName || '',
    productImage: initialData?.productImage || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = '상품명을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '상품 설명을 입력해주세요.';
    }

    if (formData.price <= 0) {
      newErrors.price = '가격은 0보다 큰 값을 입력해주세요.';
    }

    if (formData.stock < 0) {
      newErrors.stock = '재고는 0 이상의 값을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData, selectedImageFile || undefined);
    } catch (error) {
      console.error('상품 등록/수정 실패:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 메시지 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedImageFile(file);
    setImageError('');
    
    // 미리보기를 위해 URL 생성
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        productImage: previewUrl
      }));
    }
  };

  const handleImageError = (error: string) => {
    setImageError(error);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? '이벤트 상품 등록' : '이벤트 상품 수정'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'create' 
              ? '새로운 이벤트 상품을 등록하세요.'
              : '이벤트 상품 정보를 수정하세요.'
            }
          </p>
        </div>

        {/* 상품명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상품명 <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            placeholder="상품명을 입력하세요"
            error={!!errors.productName}
            disabled={isLoading}
          />
          {errors.productName && (
            <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
          )}
        </div>

        {/* 상품 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상품 이미지
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  // 파일 크기 체크 (10MB)
                  const maxSize = 10 * 1024 * 1024;
                  if (file.size > maxSize) {
                    handleImageError('파일 크기가 10MB를 초과할 수 없습니다.');
                    return;
                  }
                  
                  // 파일 타입 체크
                  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                  if (!allowedTypes.includes(file.type)) {
                    handleImageError('지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 지원)');
                    return;
                  }
                }
                handleFileSelect(file);
              }}
              disabled={isLoading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            
            {formData.productImage && (
              <div className="relative inline-block">
                <img
                  src={formData.productImage}
                  alt="상품 미리보기"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.png';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleFileSelect(null);
                    setFormData(prev => ({ ...prev, productImage: '' }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          {imageError && (
            <p className="text-red-500 text-sm mt-1">{imageError}</p>
          )}
        </div>

        {/* 상품 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상품 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="상품에 대한 자세한 설명을 입력하세요"
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* 가격과 재고 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가격 (원) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              error={!!errors.price}
              disabled={isLoading}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              재고 수량 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              error={!!errors.stock}
              disabled={isLoading}
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading 
              ? (mode === 'create' ? '등록 중...' : '수정 중...') 
              : (mode === 'create' ? '상품 등록' : '상품 수정')
            }
          </Button>
        </div>
      </form>
    </Card>
  );
};