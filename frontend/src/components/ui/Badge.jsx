import { cn } from '@/utils/helpers';
import { BADGE_CLASSES } from '@/utils/constants';

export default function Badge({ status, label, className }) {
  const colorClass = BADGE_CLASSES[status] || 'bg-muted/10 text-muted';
  const displayLabel = label || status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn('badge', colorClass, className)}>
      {displayLabel}
    </span>
  );
}

export function StatusEdge({ status }) {
  const colorMap = {
    not_submitted: 'bg-danger',
    submitted: 'bg-brass',
    under_review: 'bg-brass',
    graded: 'bg-info',
    returned_for_revision: 'bg-brass',
    rejected: 'bg-danger',
    active: 'bg-success',
    due_soon: 'bg-brass',
    expired: 'bg-danger',
    archived: 'bg-muted',
    draft: 'bg-muted',
    completed: 'bg-success',
    approved: 'bg-success',
    missing: 'bg-danger',
  };

  return (
    <div className={cn('left-edge', colorMap[status] || 'bg-muted')} />
  );
}
