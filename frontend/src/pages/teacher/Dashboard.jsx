import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { formatRelative } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import {
  StatCard, Card, CardHeader, CardBody, Skeleton, EmptyState, Badge, Button,
} from '@/components/ui';
import {
  FileText, Inbox, Clock, CheckSquare, PlusCircle,
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const statsQuery = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: () => apiRequest('/reports/teacher/stats'),
  });

  const submissionsQuery = useQuery({
    queryKey: ['teacher-submissions-recent'],
    queryFn: () => apiRequest('/submissions', { params: { limit: 5 } }),
  });

  const activityQuery = useQuery({
    queryKey: ['teacher-activity'],
    queryFn: () => apiRequest('/users/activity'),
  });

  const stats = statsQuery.data;
  const subs = submissionsQuery.data?.submissions || [];
  const activity = activityQuery.data || [];
  const loading = statsQuery.isLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/app/teacher/create-assignment')}>
            <PlusCircle size={15} />
            Create Assignment
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/teacher/submissions')}>
            Review Submissions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <Skeleton variant="stat" /><Skeleton variant="stat" />
            <Skeleton variant="stat" /><Skeleton variant="stat" />
          </>
        ) : (
          <>
            <StatCard icon={FileText} label="Total Assignments" value={stats?.total_assignments ?? 0} variant="primary" />
            <StatCard icon={Inbox} label="Total Submissions" value={stats?.total_submissions ?? 0} variant="info" />
            <StatCard icon={Clock} label="Pending Review" value={stats?.pending_reviews ?? 0} variant="warning" />
            <StatCard icon={CheckSquare} label="Graded" value={stats?.graded_submissions ?? 0} variant="success" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Recent Submissions</h3></CardHeader>
          <CardBody>
            {submissionsQuery.isLoading ? (
              <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
            ) : subs.length === 0 ? (
              <EmptyState icon={Inbox} title="No submissions yet" />
            ) : (
              <div className="space-y-1.5">
                {subs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/app/teacher/grade-center/${s.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors text-sm"
                  >
                    <span className="truncate">{s.student_name} - {s.assignment_title}</span>
                    <Badge status={s.status} />
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Activity Feed</h3></CardHeader>
          <CardBody>
            {activityQuery.isLoading ? (
              <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
            ) : activity.length === 0 ? (
              <EmptyState icon={FileText} title="No recent activity" />
            ) : (
              <div className="space-y-1.5">
                {activity.slice(0, 10).map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 text-sm">
                    <span className="text-[var(--text-secondary)]">{a.description || a.activity_type}</span>
                    <span className="text-xs text-[var(--text-muted)]">{formatRelative(a.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
