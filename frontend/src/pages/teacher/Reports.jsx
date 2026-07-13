import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Card, CardHeader, CardBody, Skeleton, EmptyState } from '@/components/ui';
import { BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

export default function TeacherReports() {
  const statsQuery = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: () => apiRequest('/reports/teacher/stats'),
  });

  const submissionsQuery = useQuery({
    queryKey: ['teacher-all-submissions'],
    queryFn: () => apiRequest('/submissions', { params: { limit: 100 } }),
  });

  const stats = statsQuery.data;
  const submissions = submissionsQuery.data?.submissions || [];
  const loading = statsQuery.isLoading;

  const statusData = [
    { name: 'Submitted', value: submissions.filter((s) => s.status === 'submitted').length },
    { name: 'Under Review', value: submissions.filter((s) => s.status === 'under_review').length },
    { name: 'Graded', value: submissions.filter((s) => s.status === 'graded').length },
    { name: 'Returned', value: submissions.filter((s) => s.status === 'returned_for_revision').length },
    { name: 'Rejected', value: submissions.filter((s) => s.status === 'rejected').length },
  ].filter((d) => d.value > 0);

  const COLORS = ['#C9922B', '#0E7C66', '#2F9E6E', '#B8463A', '#E2685A'];

  const overviewData = stats
    ? [
        { name: 'Assignments', value: stats.total_assignments || 0 },
        { name: 'Submissions', value: stats.total_submissions || 0 },
        { name: 'Pending', value: stats.pending_reviews || 0 },
        { name: 'Graded', value: stats.graded_submissions || 0 },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Reports</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader><h3 className="text-sm font-semibold">Overview</h3></CardHeader>
            <CardBody>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }}
                    />
                    <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="text-sm font-semibold">Submission Status</h3></CardHeader>
            <CardBody>
              {statusData.length === 0 ? (
                <EmptyState icon={BarChart3} title="No data yet" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }}
                      />
                      <Legend fontSize={12} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
