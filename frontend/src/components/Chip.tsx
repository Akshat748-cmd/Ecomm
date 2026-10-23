import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  active?: boolean;
  onRemove?: () => void;
  clickable?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onRemove,
  clickable = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150';

  const stateStyles = active
    ? 'bg-[#C9A24B] text-white border border-[#C9A24B]'
    : 'bg-[#F1E3BD] text-[#5A4630] border border-[#EADFC8] hover:bg-[#ebd8a7]';

  const cursorStyles = clickable || onClick ? 'cursor-pointer' : 'cursor-default';

  return (
    <div
      className={`${baseStyles} ${stateStyles} ${cursorStyles} ${className}`}
      onClick={onClick}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      {...props}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-none p-0.5 rounded-full hover:bg-black/5"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
