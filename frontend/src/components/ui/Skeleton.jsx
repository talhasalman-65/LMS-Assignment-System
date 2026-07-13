import { cn } from '@/utils/helpers';

export default function Skeleton({ variant = 'text', className }) {
  const base = 'bg-[var(--border)] rounded animate-pulse';

  const variants = {
    text: 'h-3.5 w-3/4',
    title: 'h-5 w-1/2',
    card: 'h-28 w-full',
    avatar: 'h-10 w-10 rounded-full',
    stat: 'h-24 w-full',
    row: 'h-10 w-full',
  };

  return <div className={cn(base, variants[variant] || variants.text, className)} />;
}

export function SkeletonGroup({ count = 3, variant = 'row', className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
