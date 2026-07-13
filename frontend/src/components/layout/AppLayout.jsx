import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { ToastContainer } from '@/components/ui';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-[var(--sidebar-width)] flex flex-col min-h-screen">
        <TopHeader />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
