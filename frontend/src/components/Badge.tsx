import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'sage' | 'amber' | 'coral' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    gold: 'bg-[#F1E3BD] text-[#5A4630] border border-[#C9A24B]/30',
    sage: 'bg-[#DCE8D5] text-[#2D5A27] border border-[#A4C997]',
    amber: 'bg-[#FBE7B8] text-[#7A5310] border border-[#E8C26E]',
    coral: 'bg-[#F7D4CF] text-[#8C2E24] border border-[#E89E95]',
    rose: 'bg-[#F3D9D2] text-[#6E3C33] border border-[#D9AFA5]',
    neutral: 'bg-[#F8EFD9] text-[#7A6A55] border border-[#EADFC8]',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-sans tracking-tight ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
