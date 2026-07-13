import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { logout as apiLogout } from '@/api/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';

function getBreadcrumbs(pathname) {
  const appPath = pathname.replace(/^\/app\//, '');
  const parts = appPath.split('/').filter(Boolean);

  return parts.map((part, i) => {
    const label = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = i === parts.length - 1;
    return { label, isLast };
  });
}

export default function TopHeader() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <header className="h-[var(--header-height)] bg-[var(--bg-header)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <nav className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <span className="text-[var(--text-secondary)]">
            {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : 'Loading'}
          </span>
          {breadcrumbs.length > 0 && (
            <span className="text-[var(--text-muted)] mx-0.5">/</span>
          )}
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[var(--text-muted)]">/</span>}
              <span
                className={
                  crumb.isLast
                    ? 'text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)]'
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
