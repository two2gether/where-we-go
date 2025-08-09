import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventProductMutations } from '../../hooks';
import { ProductForm } from '../../components/admin';
import { GitHubLayout } from '../../components/layout';
import type { EventProductCreateRequestDto } from '../../api/services/eventProduct.service';

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createEventProduct, isCreating } = useEventProductMutations();

  const handleSubmit = async (data: EventProductCreateRequestDto) => {
    try {
      await createEventProduct(data);
      alert('상품이 성공적으로 등록되었습니다!');
      navigate('/admin/products');
    } catch (error: any) {
      console.error('상품 등록 실패:', error);
      alert(error.response?.data?.message || '상품 등록에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      navigate('/admin/products');
    }
  };

  return (
    <GitHubLayout
      title="이벤트 상품 등록"
      subtitle="새로운 이벤트 상품을 등록하여 고객들에게 제공하세요."
    >
      <div className="max-w-4xl mx-auto py-8">
        <ProductForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating}
        />
      </div>
    </GitHubLayout>
  );
};

export default ProductCreatePage;