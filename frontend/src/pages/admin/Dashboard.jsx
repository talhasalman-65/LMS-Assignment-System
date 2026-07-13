import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import {
  StatCard, Card, CardHeader, CardBody, Skeleton, EmptyState, Button,
} from '@/components/ui';
import { Users, FileText, Inbox, Clock, UserPlus, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiRequest('/reports/admin/stats'),
  });

  const logsQuery = useQuery({
    queryKey: ['admin-logs-recent'],
    queryFn: () => apiRequest('/logs', { params: { limit: 10 } }),
  });

  const stats = statsQuery.data;
  const logs = logsQuery.data?.logs || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/app/administrator/users')}>
            <UserPlus size={15} />
            Create User
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/administrator/reports')}>
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statsQuery.isLoading ? (
          <>
            <Skeleton variant="stat" /><Skeleton variant="stat" /><Skeleton variant="stat" />
          </>
        ) : (
          <>
            <StatCard icon={Users} label="Total Users" value={(stats?.total_students ?? 0) + (stats?.total_teachers ?? 0) + (stats?.total_admins ?? 0)} variant="primary" />
            <StatCard icon={FileText} label="Assignments" value={stats?.total_assignments ?? 0} variant="info" />
            <StatCard icon={Inbox} label="Submissions" value={stats?.total_submissions ?? 0} variant="success" />
            <StatCard icon={Users} label="Students" value={stats?.total_students ?? 0} variant="info" />
            <StatCard icon={Users} label="Teachers" value={stats?.total_teachers ?? 0} variant="success" />
            <StatCard icon={Clock} label="Pending" value={stats?.pending_submissions ?? 0} variant="warning" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Recent Activity</h3></CardHeader>
          <CardBody>
            {logsQuery.isLoading ? (
              <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
            ) : logs.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No activity" />
            ) : (
              <div className="space-y-1.5">
                {logs.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 text-sm border-b border-[var(--border)] last:border-b-0">
                    <span className="text-[var(--text-secondary)]">
                      {l.action} {l.entity_type ? `(${l.entity_type})` : ''}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(l.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Quick Actions</h3></CardHeader>
          <CardBody className="space-y-2">
            <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/app/administrator/users')}>
              Manage Users
            </Button>
            <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/app/administrator/settings')}>
              System Settings
            </Button>
            <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/app/administrator/logs')}>
              View Logs
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
