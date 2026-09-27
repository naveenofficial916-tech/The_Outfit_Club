import React from 'react';
import './Badge.css';

export interface BadgeProps {
  variant?: 'subtle' | 'dark' | 'accent';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'subtle',
  children,
  className = '',
}) => {
  return (
    <span className={`toc-badge toc-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};
