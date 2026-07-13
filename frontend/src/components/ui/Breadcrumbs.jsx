import { useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.replace(/^\//, '').split('/').filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
      {parts.map((part, i) => {
        const label = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[var(--text-muted)]">/</span>}
            {i === parts.length - 1 ? (
              <span className="text-[var(--text-primary)] font-medium">{label}</span>
            ) : (
              <span>{label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
