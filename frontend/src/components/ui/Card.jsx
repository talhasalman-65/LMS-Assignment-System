import { cn } from '@/utils/helpers';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-card)] border border-[var(--border)] rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}
