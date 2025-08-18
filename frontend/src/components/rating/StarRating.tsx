import React, { useState } from 'react';

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRatingChange,
  size = 'md',
  readonly = false,
  showNumber = false,
  className = '',
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [tempRating, setTempRating] = useState(rating);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleStarClick = (starRating: number) => {
    if (readonly || !onRatingChange) return;
    
    setTempRating(starRating);
    onRatingChange(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || tempRating || rating;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${sizeClasses[size]} transition-colors ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            }`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
          >
            <svg
              className={`w-full h-full ${
                star <= displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 fill-current'
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      
      {showNumber && (
        <span className="text-sm text-gray-600 ml-2">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;