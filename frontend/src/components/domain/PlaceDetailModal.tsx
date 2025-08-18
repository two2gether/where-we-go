import React from 'react';
import { Button, Card, Spinner } from '../base';
import { usePlace } from '../../hooks/usePlaces';
import type { Place } from '../../api/types';

interface PlaceDetailModalProps {
  placeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  placeId,
  isOpen,
  onClose
}) => {
  const { data: place, isLoading, error } = usePlace(placeId || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">장소 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-error-600 mb-4">장소 정보를 불러오는 중 오류가 발생했습니다.</p>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
          )}

          {place && (
            <div className="space-y-6">
              {/* 장소 이미지 */}
              {place.photo && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={place.photo}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 기본 정보 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{place.name}</h3>
                <p className="text-gray-600 mb-4">{place.category}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="font-medium">{place.averageRating}</span>
                    <span className="text-gray-500 ml-1">({place.reviewCount}개 리뷰)</span>
                  </div>
                  {place.googleRating && (
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-1">G</span>
                      <span className="text-sm text-gray-600">{place.googleRating}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">위치 정보</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">주소:</span> {place.address}</p>
                    {place.roadAddress && (
                      <p><span className="font-medium">도로명:</span> {place.roadAddress}</p>
                    )}
                    <p><span className="font-medium">지역:</span> {place.regionSummary}</p>
                    {place.distance && (
                      <p><span className="font-medium">거리:</span> {place.distance}m</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">추가 정보</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {place.phone && (
                      <p><span className="font-medium">전화번호:</span> {place.phone}</p>
                    )}
                    {place.bookmarkCount !== undefined && (
                      <p><span className="font-medium">북마크:</span> {place.bookmarkCount}개</p>
                    )}
                    <p><span className="font-medium">좌표:</span> {place.latitude}, {place.longitude}</p>
                  </div>
                </div>
              </div>

              {/* 지도 링크 */}
              {place.placeUrl && (
                <div>
                  <a
                    href={place.placeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    구글 지도에서 보기
                  </a>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  닫기
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => {
                    // Add to course functionality implementation pending
                    console.log('Add to course:', placeId);
                  }}
                >
                  코스에 추가
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};