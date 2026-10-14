import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  id: string;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-[#DCE8D5]',
      border: 'border-[#A4C997]',
      text: 'text-[#2D5A27]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#2D5A27] shrink-0" />,
    },
    warning: {
      bg: 'bg-[#FBE7B8]',
      border: 'border-[#E8C26E]',
      text: 'text-[#7A5310]',
      icon: <AlertTriangle className="w-5 h-5 text-[#7A5310] shrink-0" />,
    },
    error: {
      bg: 'bg-[#F7D4CF]',
      border: 'border-[#E89E95]',
      text: 'text-[#8C2E24]',
      icon: <AlertCircle className="w-5 h-5 text-[#8C2E24] shrink-0" />,
    },
    info: {
      bg: 'bg-[#F8EFD9]',
      border: 'border-[#C9A24B]',
      text: 'text-[#5A4630]',
      icon: <Info className="w-5 h-5 text-[#C9A24B] shrink-0" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      role="status"
      className={`flex items-start gap-3 p-4 rounded-[12px] border ${config.border} ${config.bg} shadow-[0_4px_20px_rgba(90,70,48,0.1)] min-w-[300px] max-w-sm animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      {config.icon}
      <div className="flex-1 pr-2">
        <h4 className={`text-sm font-medium ${config.text}`}>{title}</h4>
        {message && (
          <p className="mt-0.5 text-xs text-[#7A6A55] leading-relaxed">
            {message}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-[#7A6A55] hover:text-[#5A4630] p-1 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
