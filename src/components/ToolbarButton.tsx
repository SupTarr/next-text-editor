import type { ReactNode } from 'react';

export interface ToolbarButtonProps {
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  ariaLabel?: string;
  children: ReactNode;
  variant?: 'icon' | 'action' | 'dangerAction';
  className?: string;
}

export default function ToolbarButton({
  isActive = false,
  disabled = false,
  onClick,
  title,
  ariaLabel,
  children,
  variant = 'icon',
  className = '',
}: ToolbarButtonProps) {
  let baseStyles = 'rounded-md border flex items-center transition-colors shadow-2xs';

  if (variant === 'icon') {
    baseStyles += ' w-8 h-8 justify-center';
    if (disabled) {
      baseStyles += ' bg-white/50 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-50';
    } else if (isActive) {
      baseStyles += ' bg-blue-50 border-blue-300 text-blue-700 font-bold cursor-pointer';
    } else {
      baseStyles += ' bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer';
    }
  } else if (variant === 'action') {
    baseStyles += ' h-8 px-2.5 gap-1 text-xs font-medium';
    if (disabled) {
      baseStyles += ' bg-white/50 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-50';
    } else {
      baseStyles += ' bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 cursor-pointer';
    }
  } else if (variant === 'dangerAction') {
    baseStyles += ' h-8 px-2.5 gap-1 text-xs font-medium';
    if (disabled) {
      baseStyles += ' bg-white/50 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-50';
    } else {
      baseStyles += ' bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:bg-rose-100 cursor-pointer';
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      aria-pressed={variant === 'icon' ? isActive : undefined}
      className={`${baseStyles} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

