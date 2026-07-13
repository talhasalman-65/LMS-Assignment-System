import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-teal text-white hover:bg-teal/90 active:bg-teal-dark',
  secondary: 'border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:bg-[var(--border)]',
  danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] active:bg-[var(--border)]',
  success: 'bg-success text-white hover:bg-success/90',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-3 py-2 text-sm gap-2',
  lg: 'px-4 py-2.5 text-sm gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  iconOnly = false,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal',
        variants[variant],
        sizes[size],
        iconOnly && 'px-2',
        (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />}
      {children}
    </button>
  );
}
