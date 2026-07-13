import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Card, CardHeader, CardBody, Skeleton, StatCard } from '@/components/ui';
import { Users, FileText, Inbox } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function AdminReports() {
  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiRequest('/reports/admin/stats'),
  });

  const stats = statsQuery.data;
  const overviewData = stats
    ? [
        { name: 'Students', value: stats.total_students || 0 },
        { name: 'Teachers', value: stats.total_teachers || 0 },
        { name: 'Admins', value: stats.total_admins || 0 },
        { name: 'Assignments', value: stats.total_assignments || 0 },
        { name: 'Submissions', value: stats.total_submissions || 0 },
        { name: 'Pending', value: stats.pending_submissions || 0 },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Reports</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statsQuery.isLoading ? (
          <><Skeleton variant="stat" /><Skeleton variant="stat" /><Skeleton variant="stat" /></>
        ) : (
          <>
            <StatCard icon={Users} label="Total Users" value={(stats?.total_students ?? 0) + (stats?.total_teachers ?? 0) + (stats?.total_admins ?? 0)} variant="primary" />
            <StatCard icon={FileText} label="Assignments" value={stats?.total_assignments ?? 0} variant="info" />
            <StatCard icon={Inbox} label="Submissions" value={stats?.total_submissions ?? 0} variant="success" />
          </>
        )}
      </div>

      <Card>
        <CardHeader><h3 className="text-sm font-semibold">System Overview</h3></CardHeader>
        <CardBody>
          {statsQuery.isLoading ? (
            <Skeleton variant="card" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} />
                  <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
