import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-cardDark rounded-2xl p-5 shadow-lg border border-borderBase ${className} ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      {children}
    </div>
  );
};