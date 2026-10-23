import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'surface-alt' | 'flat';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  hoverable = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-[#FFFFFF] border border-[#EADFC8] shadow-[0_4px_20px_rgba(90,70,48,0.08)]',
    'surface-alt': 'bg-[#F8EFD9] border border-[#EADFC8] shadow-[0_4px_20px_rgba(90,70,48,0.08)]',
    flat: 'bg-[#FFFFFF] border border-[#EADFC8]',
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-300 hover:shadow-[0_8px_24px_rgba(90,70,48,0.12)] hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-[12px] p-5 ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
