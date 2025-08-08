import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed relative border';
  
  const variantClasses = {
    primary: 'bg-secondary-600 text-white hover:bg-secondary-700 border-secondary-600 hover:border-secondary-700 shadow-sm',
    secondary: 'bg-github-canvas border-github-border text-primary-900 hover:bg-github-canvas-subtle hover:border-github-border-muted',
    outline: 'border-github-border text-primary-700 bg-github-canvas hover:bg-github-canvas-subtle hover:border-github-border-muted',
    ghost: 'text-primary-700 hover:bg-github-canvas-subtle border-transparent hover:border-github-border-muted',
    danger: 'bg-accent-red text-white hover:bg-red-700 border-accent-red hover:border-red-700 shadow-sm'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 h-8 rounded-md',
    md: 'px-4 py-2 text-sm gap-2 h-9 rounded-md',
    lg: 'px-6 py-2.5 text-base gap-2.5 h-11 rounded-md'
  };
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <span className={`flex-shrink-0 ${
        position === 'left' && children ? 'mr-1' : 
        position === 'right' && children ? 'ml-1' : ''
      }`}>
        {icon}
      </span>
    );
  };

  const renderLoading = () => (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      {children && <span>처리 중...</span>}
    </div>
  );

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {/* Simple ripple effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-200" />
      
      {loading ? renderLoading() : (
        <>
          {renderIcon('left')}
          {children}
          {renderIcon('right')}
        </>
      )}
    </button>
  );
};