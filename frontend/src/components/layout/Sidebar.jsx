import { NavLink } from 'react-router-dom';
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
          'fixed top-0 left-0 z-50 h-full w-[var(--sidebar-width)]',
          'bg-[var(--bg-sidebar)] text-[var(--text-inverse)]',
          'flex flex-col transition-transform duration-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-5 h-14 border-b border-white/10 shrink-0">
          <div className="w-7 h-7 rounded bg-teal flex items-center justify-center text-xs font-bold">
            S
          </div>
          <span className="font-semibold text-sm">SmartAssign</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <div className="px-5 py-2 text-2xs uppercase tracking-wider opacity-50 font-semibold">
            Main Menu
          </div>
          {config.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors duration-150',
                  'text-white/70 hover:text-white hover:bg-white/10',
                  isActive && 'text-white bg-white/15 border-r-[3px] border-teal'
                )
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.fullName || user?.full_name || 'User'}
              </div>
              <div className="text-xs text-white/60 capitalize">{role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
