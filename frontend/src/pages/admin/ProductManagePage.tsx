import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminEventProducts, useEventProductMutations } from '../../hooks';
import { Button, Spinner, Card, Badge } from '../../components/base';
import { GitHubLayout } from '../../components/layout';

const ProductManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const { data: productsResponse, isLoading, error } = useAdminEventProducts(currentPage, 10);
  const { deleteEventProduct, isDeleting } = useEventProductMutations();

  const handleCreateProduct = () => {
    navigate('/admin/products/create');
  };

  const handleEditProduct = (productId: number) => {
    navigate(`/admin/products/${productId}/edit`);
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (confirm(`"${productName}" 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await deleteEventProduct(productId);
        alert('상품이 삭제되었습니다.');
      } catch (error: any) {
        console.error('상품 삭제 실패:', error);
        alert(error.response?.data?.message || '상품 삭제에 실패했습니다.');
      }
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <GitHubLayout title="상품 관리" subtitle="이벤트 상품을 관리하세요.">
        <div className="flex justify-center items-center min-h-64">
          <Spinner size="lg" />
        </div>
      </GitHubLayout>
    );
  }

  if (error) {
    return (
      <GitHubLayout title="상품 관리" subtitle="이벤트 상품을 관리하세요.">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">상품 목록을 불러오는데 실패했습니다.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </GitHubLayout>
    );
  }

  const products = productsResponse?.content || [];
  const hasNextPage = productsResponse && !productsResponse.last;
  const hasPreviousPage = productsResponse && !productsResponse.first;

  return (
    <GitHubLayout
      title="상품 관리"
      subtitle="이벤트 상품을 등록, 수정, 삭제할 수 있습니다."
    >
      <div className="max-w-7xl mx-auto py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
            <p className="text-gray-600 mt-1">총 {productsResponse?.totalElements || 0}개의 상품이 있습니다.</p>
          </div>
          <Button variant="primary" onClick={handleCreateProduct}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 상품 등록
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 상품이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 이벤트 상품을 등록해보세요!</p>
            <Button variant="primary" onClick={handleCreateProduct}>
              상품 등록하기
            </Button>
          </div>
        ) : (
          <>
            {/* 상품 목록 */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {products.map((product) => (
                <Card key={product.productId} className="p-6">
                  <div className="flex items-center space-x-6">
                    {/* 상품 이미지 */}
                    {product.productImage ? (
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {product.productName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>가격: {formatPrice(product.price)}원</span>
                            <span>재고: {product.stock}개</span>
                            <span>상품ID: {product.productId}</span>
                            <span>등록일: {formatDate(product.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant={product.stock > 0 ? "success" : "error"}>
                            {product.stock > 0 ? "재고있음" : "품절"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product.productId)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.productId, product.productName)}
                        disabled={isDeleting}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 페이지네이션 */}
            {(hasNextPage || hasPreviousPage) && (
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!hasPreviousPage}
                >
                  이전
                </Button>
                <span className="text-sm text-gray-600">
                  페이지 {currentPage + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </GitHubLayout>
  );
};

export default ProductManagePage;