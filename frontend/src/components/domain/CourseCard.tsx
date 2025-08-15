import React from 'react';
import { Card, Badge, Avatar, Button } from '../base';
import { useCourseLikes, useCourseBookmarks } from '../../hooks';
import { useAuthStore } from '../../store/authStore';

export interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  region: string;
  theme: string;
  rating: number;
  likeCount: number;
  duration: string;
  author: {
    name: string;
    avatar: string;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
  onViewDetails?: (id: number) => void;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  region,
  theme,
  rating,
  likeCount,
  duration,
  author,
  isLiked = false,
  isBookmarked = false,
  onViewDetails,
  className = ''
}) => {
  const { user } = useAuthStore();
  const { toggleCourseLike, isToggling: isLikeToggling } = useCourseLikes();
  const { toggleCourseBookmark, isToggling: isBookmarkToggling } = useCourseBookmarks();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      await toggleCourseLike(id, isLiked);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      await toggleCourseBookmark(id, isBookmarked);
    } catch (error) {
      console.error('북마크 처리 실패:', error);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(id);
  };

  return (
    <Card 
      variant="default" 
      padding="none" 
      hover 
      className={className}
      onClick={handleViewDetails}
    >
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-3 right-3">
          <Badge variant="primary" size="sm">
            {theme}
          </Badge>
        </div>
        <button
          onClick={handleLike}
          disabled={isLikeToggling}
          className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors disabled:opacity-50"
        >
          <svg 
            className={`w-5 h-5 transition-colors ${
              isLiked ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'
            }`} 
            fill={isLiked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          onClick={handleBookmark}
          disabled={isBookmarkToggling}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors disabled:opacity-50"
        >
          <svg 
            className={`w-5 h-5 transition-colors ${
              isBookmarked ? 'text-blue-500 fill-current' : 'text-gray-600 hover:text-blue-500'
            }`} 
            fill={isBookmarked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {region}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {duration}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar src={author?.avatar || ''} name={author?.name || 'Unknown'} size="sm" />
            <span className="text-sm text-gray-600">{author?.name || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-medium">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{likeCount}</span>
            </div>
          </div>
        </div>
        
        <Button variant="primary" size="md" fullWidth onClick={handleViewDetails}>
          코스 자세히 보기
        </Button>
      </div>
    </Card>
  );
};