import React, { useState } from 'react';
import { Card, Badge, Button } from '../base';

export interface PlaceCardProps {
  id: string; // placeId는 string 타입
  name: string;
  description: string;
  image: string;
  category: string;
  region: string;
  rating: number;
  reviewCount: number;
  isBookmarked: boolean;
  address: string;
  tags: string[];
  onBookmarkToggle?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onAddToCourse?: (id: string) => void;
  // 선택 모드 관련
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  id,
  name,
  description,
  image,
  category,
  region,
  rating,
  reviewCount,
  isBookmarked,
  address,
  tags,
  onBookmarkToggle,
  onViewDetails,
  onAddToCourse,
  // 선택 모드 관련
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  className = ''
}) => {
  // 이미지 로딩 상태 관리 - 기본값을 true로 설정하여 깜빡임 방지
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // 카테고리별 기본 placeholder 이미지
  const getDefaultImageByCategory = (category: string) => {
    const categoryImages: Record<string, string> = {
      '관광지': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
      '맛집': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&auto=format',
      '숙박': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format',
      '문화재': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop&auto=format',
      '시장': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&auto=format',
      '카페': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop&auto=format',
    };
    
    return categoryImages[category] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format';
  };
  
  const defaultImage = getDefaultImageByCategory(category);
  
  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(id);
  };

  const handleCardClick = () => {
    if (isSelectionMode) {
      onSelect?.(id);
    } else {
      onViewDetails?.(id);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(id);
  };

  const handleAddToCourse = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCourse?.(id);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // 실제 사용할 이미지 URL 결정
  const imageUrl = (imageError || !image) ? defaultImage : image;

  return (
    <div 
      className={`group bg-white rounded-lg border border-github-border hover:border-github-border-subtle transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden flex flex-col h-full ${
        className
      } ${isSelectionMode && isSelected ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}
      onClick={handleCardClick}
    >
      {/* 이미지 컨테이너 */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* 이미지 위 오버레이 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 카테고리 배지 */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-github-canvas-subtle text-github-neutral border border-github-border backdrop-blur-sm">
            {category}
          </span>
        </div>
        
        {/* 북마크 버튼 */}
        <button
          onClick={handleBookmarkToggle}
          className="absolute top-3 right-3 p-2 bg-github-canvas-subtle/90 backdrop-blur-sm rounded-full border border-github-border hover:bg-github-canvas transition-all duration-200"
          title={isBookmarked ? '북마크 해제' : '북마크 추가'}
        >
          <svg 
            className={`w-4 h-4 transition-colors ${
              isBookmarked ? 'text-red-500 fill-current' : 'text-github-neutral-muted hover:text-github-neutral'
            }`} 
            fill={isBookmarked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        {/* 선택 모드 체크박스 */}
        {isSelectionMode && (
          <div className="absolute top-3 right-16">
            <button
              onClick={handleSelect}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary-500 border-primary-500 text-white shadow-sm' 
                  : 'bg-github-canvas-subtle/90 border-github-border hover:border-primary-500 hover:bg-primary-50 backdrop-blur-sm'
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* 카드 내용 */}
      <div className="p-6 flex flex-col flex-1">
        {/* 제목과 주소 - 고정된 높이 영역 */}
        <div className="mb-4 min-h-[100px] flex flex-col">
          <h3 className="text-lg font-semibold text-github-neutral group-hover:text-primary-600 transition-colors duration-200 line-clamp-1 mb-2">
            {name}
          </h3>
          <div className="flex items-start gap-2 flex-1">
            <svg className="w-4 h-4 text-github-neutral-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-sm text-github-neutral-muted leading-relaxed flex-1">
              {address}
            </p>
          </div>
        </div>
        
        {/* 평점과 지역 - 하단 고정 영역 */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-base font-medium text-github-neutral">{rating?.toFixed(1) || '0.0'}</span>
              </div>
              {reviewCount > 0 && (
                <span className="text-sm text-github-neutral-muted">
                  ({reviewCount}개 리뷰)
                </span>
              )}
            </div>
            
            {region && (
              <span className="text-sm text-github-neutral-muted bg-github-canvas-subtle px-3 py-1.5 rounded-full font-medium">
                {region}
              </span>
            )}
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleViewDetails}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              상세보기
            </button>
            {!isSelectionMode && (
              <button
                onClick={handleAddToCourse}
                className="px-4 py-2.5 bg-github-canvas-subtle hover:bg-github-canvas text-github-neutral font-medium rounded-lg border border-github-border transition-colors duration-200"
                title="코스에 추가"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};