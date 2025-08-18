import React from 'react';
import { CoursePlace } from '../../api/types';

interface CourseMapProps {
  places: CoursePlace[];
  className?: string;
}

const CourseMap: React.FC<CourseMapProps> = ({ places, className = '' }) => {

  // 안정적인 정적 지도 사용 (Google Maps API 문제 회피)
  return (
    <div className={`bg-white rounded-lg border border-github-border ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-github-neutral mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          코스 지도 ({places.length}개 장소)
        </h3>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0l-6-3" />
              </svg>
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">코스 지도</p>
                <p className="text-blue-700 text-xs">장소들을 순서대로 표시하며, 좌표를 활용해 실제 길찾기가 가능합니다.</p>
              </div>
            </div>
          </div>

        <div className="space-y-3">
          {places.map((place, index) => (
            <div key={place.placeId} className="bg-github-canvas-subtle rounded-lg p-4 border border-github-border">
              <div className="flex items-start space-x-3">
                {/* 번호 */}
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {place.visitOrder}
                </div>
                
                {/* 메인 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-github-neutral truncate">{place.name}</h4>
                      <p className="text-sm text-github-neutral-muted">{place.category}</p>
                      <div className="flex items-center text-xs text-github-neutral-muted mt-1">
                        <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                      </div>
                      {place.distanceFromPrevious && index > 0 && (
                        <p className="text-xs text-github-neutral-muted mt-1">
                          🚶‍♂️ 이전 장소로부터 {place.distanceFromPrevious}m
                        </p>
                      )}
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="flex space-x-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-md border border-primary-200"
                        title="Google Maps에서 보기"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${place.latitude}, ${place.longitude}`);
                          const toast = document.createElement('div');
                          toast.textContent = '좌표가 복사되었습니다!';
                          toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
                          document.body.appendChild(toast);
                          setTimeout(() => toast.remove(), 2000);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-md border border-primary-200"
                        title="좌표 복사"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 이미지 */}
                {place.imageUrl && (
                  <div className="flex-shrink-0 hidden sm:block">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              {/* 모바일에서 이미지 표시 */}
              {place.imageUrl && (
                <div className="mt-3 sm:hidden">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {/* 전체 코스 길찾기 버튼 */}
          <button
            onClick={() => {
              const waypoints = places.map(place => `${place.latitude},${place.longitude}`).join('/');
              const url = `https://www.google.com/maps/dir/${waypoints}`;
              window.open(url, '_blank');
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0l-6-3" />
            </svg>
            <span>Google Maps에서 전체 코스 길찾기</span>
          </button>

          {/* 이용 팁 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">코스 이용 가이드</p>
                <div className="space-y-2 text-xs text-blue-700">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">🗺️</span>
                    <span>위의 <strong>"전체 코스 길찾기"</strong> 버튼으로 한 번에 모든 경로를 확인할 수 있습니다</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">📍</span>
                    <span>각 장소 옆의 버튼으로 <strong>개별 길찾기</strong> 또는 <strong>좌표 복사</strong>가 가능합니다</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">🚶‍♂️</span>
                    <span>거리 정보를 참고하여 <strong>이동 시간</strong>을 계획하세요</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">⏰</span>
                    <span>번호 순서대로 방문하면 가장 <strong>효율적인 동선</strong>입니다</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMap;