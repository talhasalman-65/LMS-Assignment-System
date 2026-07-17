import { NavLink, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/utils/helpers';
import {
  LayoutDashboard,
  FileText,
  Upload,
  GraduationCap,
  User,
  PlusCircle,
  Inbox,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_CONFIG = {
  student: {
    items: [
      { to: '/app/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/student/assignments', icon: FileText, label: 'Assignments' },
      { to: '/app/student/submissions', icon: Upload, label: 'My Submissions' },
      { to: '/app/student/grades', icon: GraduationCap, label: 'Grades & Feedback' },
      { to: '/app/student/profile', icon: User, label: 'Profile' },
    ],
  },
  teacher: {
    items: [
      { to: '/app/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/teacher/create-assignment', icon: PlusCircle, label: 'Create Assignment' },
      { to: '/app/teacher/assignments', icon: FileText, label: 'Assignments' },
      { to: '/app/teacher/submissions', icon: Inbox, label: 'Submissions' },
      { to: '/app/teacher/grade-center', icon: CheckSquare, label: 'Grade Center' },
      { to: '/app/teacher/reports', icon: BarChart3, label: 'Reports' },
      { to: '/app/teacher/profile', icon: User, label: 'Profile' },
    ],
  },
  administrator: {
    items: [
      { to: '/app/administrator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/app/administrator/users', icon: Users, label: 'Users' },
      { to: '/app/administrator/assignments', icon: FileText, label: 'Assignments' },
      { to: '/app/administrator/reports', icon: BarChart3, label: 'Reports' },
      { to: '/app/administrator/settings', icon: Settings, label: 'System Settings' },
      { to: '/app/administrator/logs', icon: ClipboardList, label: 'Logs' },
      { to: '/app/administrator/profile', icon: User, label: 'Profile' },
    ],
  },
};

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const role = user?.role;

  const config = NAV_CONFIG[role];
  if (!config) return null;

  const initials = (user?.fullName || user?.full_name || '?')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full',
          'bg-[var(--bg-sidebar)] text-[var(--text-inverse)]',
          'flex flex-col overflow-hidden',
          'transition-transform duration-200 lg:translate-x-0',
          'lg:transition-[width] lg:duration-300',
          sidebarOpen
            ? 'translate-x-0 w-[var(--sidebar-width)] lg:w-[var(--sidebar-width)]'
            : '-translate-x-full w-[var(--sidebar-width)] lg:w-[var(--sidebar-collapsed-width)]'
        )}
      >
        <div
          className={cn(
            'flex items-center h-14 border-b border-white/10 shrink-0',
            sidebarOpen ? 'gap-3 px-5' : 'justify-center'
          )}
        >
          <div
            onClick={() => navigate(`/app/${role}/dashboard`)}
            className="w-7 h-7 rounded bg-teal flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer hover:bg-[var(--accent-hover)] transition-colors duration-200"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/app/${role}/dashboard`); }}
            aria-label="Go to dashboard"
          >
            S
          </div>
          {sidebarOpen && (
            <>
              <span className="font-semibold text-sm flex-1">SmartAssign</span>
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          )}
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {sidebarOpen && (
            <div className="px-5 py-2 text-2xs uppercase tracking-wider text-white/50 font-semibold">
              Main Menu
            </div>
          )}
          {config.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 text-sm transition-all duration-200',
                  sidebarOpen
                    ? 'px-5 py-2.5'
                    : 'justify-center py-3',
                  isActive
                    ? 'text-white bg-[var(--sidebar-nav-bg-active)] border-r-[3px] border-[var(--sidebar-nav-border-active)]'
                    : 'text-[var(--sidebar-nav-text)] hover:text-[var(--sidebar-nav-text-hover)] hover:bg-[var(--sidebar-nav-bg-hover)]'
                )
              }
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                'group-hover:bg-[var(--accent-subtle)]'
              )}>
                <item.icon
                  size={18}
                  className="transition-colors duration-200 group-hover:text-[var(--accent-light)]"
                />
              </div>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10">
          <div
            className={cn(
              'flex items-center',
              sidebarOpen ? 'gap-3 p-4' : 'justify-center py-4'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user?.fullName || user?.full_name || 'User'}
                </div>
                <div className="text-xs text-white/60 capitalize">{role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
