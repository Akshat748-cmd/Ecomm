import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#EADFC8] rounded-[12px] bg-[#FFFFFF] ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-[#F8EFD9] border border-[#EADFC8] flex items-center justify-center text-[#C9A24B] mb-4">
        {icon || <PackageOpen className="w-7 h-7 stroke-[1.5]" />}
      </div>
      <h3 className="text-lg font-serif font-semibold text-[#5A4630] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#7A6A55] max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
