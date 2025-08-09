import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventProductDetail, useEventProductMutations } from '../../hooks';
import { ProductForm } from '../../components/admin';
import { GitHubLayout } from '../../components/layout';
import { Spinner, Button } from '../../components/base';
import type { EventProductUpdateRequestDto } from '../../api/services/eventProduct.service';

const ProductEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const numericProductId = parseInt(productId || '0');
  
  const { data: productResponse, isLoading: isLoadingProduct, error } = useEventProductDetail(numericProductId);
  const { updateEventProduct, isUpdating } = useEventProductMutations();

  const handleSubmit = async (data: EventProductUpdateRequestDto) => {
    try {
      await updateEventProduct({ eventProductId: numericProductId, data });
      alert('상품이 성공적으로 수정되었습니다!');
      navigate('/admin/products');
    } catch (error: any) {
      console.error('상품 수정 실패:', error);
      alert(error.response?.data?.message || '상품 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    if (confirm('수정 사항이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
      navigate('/admin/products');
    }
  };

  if (isLoadingProduct) {
    return (
      <GitHubLayout title="상품 수정" subtitle="이벤트 상품 정보를 수정하세요.">
        <div className="flex justify-center items-center min-h-64">
          <Spinner size="lg" />
        </div>
      </GitHubLayout>
    );
  }

  if (error || !productResponse?.data) {
    return (
      <GitHubLayout title="상품 수정" subtitle="이벤트 상품 정보를 수정하세요.">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">상품 정보를 불러오는데 실패했습니다.</p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
            <Button variant="primary" onClick={() => navigate('/admin/products')}>
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  const product = productResponse.data;

  return (
    <GitHubLayout
      title="이벤트 상품 수정"
      subtitle="이벤트 상품 정보를 수정하세요."
    >
      <div className="max-w-4xl mx-auto py-8">
        <ProductForm
          mode="edit"
          initialData={{
            productId: product.productId,
            productName: product.productName,
            productImage: product.productImage,
            description: product.description,
            price: product.price,
            stock: product.stock
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isUpdating}
        />
      </div>
    </GitHubLayout>
  );
};

export default ProductEditPage;