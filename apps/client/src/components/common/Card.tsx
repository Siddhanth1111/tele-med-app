import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-2xl border border-gray-200 shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-lg transition cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || icon) && (
        <div className="mb-4">
          {icon && <div className="mb-3">{icon}</div>}
          {title && <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};