import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  variant = 'circular',
  className = '',
  fallbackIcon
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };
  
  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };
  
  const baseClasses = 'inline-flex items-center justify-center bg-gray-100 overflow-hidden flex-shrink-0';
  
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className={classes}>
      {src && (
        <img
          src={src}
          alt={alt || name || '사용자 아바타'}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )}
      
      {!src && name && (
        <span className="font-medium text-gray-600">
          {getInitials(name)}
        </span>
      )}
      
      {!src && !name && fallbackIcon && (
        <span className="text-gray-400">
          {fallbackIcon}
        </span>
      )}
      
      {!src && !name && !fallbackIcon && (
        <svg className="w-3/4 h-3/4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
  );
};