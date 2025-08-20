import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient' | 'cyber' | 'organic';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  glow?: boolean;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  onClick,
  glow = false,
  animate = false
}) => {
  const baseClasses = 'rounded-md overflow-hidden transition-colors duration-200 relative group border';
  
  const variantClasses = {
    default: 'bg-github-canvas border-github-border',
    elevated: 'bg-github-canvas border-github-border shadow-sm',
    outlined: 'bg-github-canvas border-github-border hover:border-github-border-muted',
    glass: 'bg-github-canvas-subtle border-github-border-muted',
    gradient: 'bg-github-canvas border-github-border',
    cyber: 'bg-github-canvas border-github-border hover:border-secondary-300',
    organic: 'bg-github-canvas border-github-border hover:border-github-border-muted'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  };
  
  const hoverClasses = hover ? 'hover:bg-github-canvas-subtle cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  const glowClasses = glow ? 'shadow-sm' : '';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${clickableClasses}
    ${glowClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-white/20 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-5 ${className}`}>
    {children}
  </div>
);

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-t border-white/20 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);