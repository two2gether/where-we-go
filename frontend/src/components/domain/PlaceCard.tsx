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
    <Card 
      variant="default" 
      padding="none" 
      hover 
      className={`${className} ${isSelectionMode && isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="gray" size="sm">
            {category}
          </Badge>
        </div>
        <button
          onClick={handleBookmarkToggle}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <svg 
            className={`w-5 h-5 ${
              isBookmarked ? 'text-red-500 fill-current' : 'text-gray-600'
            }`} 
            fill={isBookmarked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        {/* 선택 모드일 때 체크박스 */}
        {isSelectionMode && (
          <div className="absolute top-3 right-16">
            <button
              onClick={handleSelect}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : 'bg-white/90 border-gray-300 hover:border-primary-500'
              }`}
            >
              {isSelected && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {name}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {address}
          </p>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map(tag => (
            <Badge key={tag} variant="gray" size="sm">
              #{tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-medium">{rating}</span>
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
          <span className="text-sm text-gray-600">{region}</span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="primary" size="sm" fullWidth onClick={handleViewDetails}>
            상세보기
          </Button>
          {!isSelectionMode && (
            <Button variant="outline" size="sm" onClick={handleAddToCourse}>
              코스에 추가
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};