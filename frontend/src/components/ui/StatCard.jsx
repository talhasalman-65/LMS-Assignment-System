import { cn } from '@/utils/helpers';

const iconBg = {
  primary: 'bg-teal/10 text-teal',
  success: 'bg-success/10 text-success',
  warning: 'bg-brass/10 text-brass',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
};

export default function StatCard({ icon: Icon, label, value, change, variant = 'primary' }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
      {Icon && (
        <div className={cn('w-11 h-11 rounded-md flex items-center justify-center shrink-0', iconBg[variant])}>
          <Icon size={22} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--text-secondary)] font-medium mb-0.5">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn('text-xs mt-0.5', change >= 0 ? 'text-success' : 'text-danger')}>
            {change >= 0 ? '+' : ''}{change}
          </div>
        )}
      </div>
    </div>
  );
}
