import { cn } from '@/utils/helpers';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      {Icon && (
        <div className="mb-4 text-[var(--text-muted)]">
          <Icon size={40} />
        </div>
      )}
      {title && <h3 className="text-base font-semibold mb-1">{title}</h3>}
      {description && <p className="text-sm text-[var(--text-secondary)] max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
