import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/store/ui';
import { cn } from '@/utils/helpers';

export default function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-[margin] duration-300',
          'ml-0 lg:ml-[var(--sidebar-collapsed-width)]',
          sidebarOpen && 'lg:ml-[var(--sidebar-width)]'
        )}
      >
        <TopHeader />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
