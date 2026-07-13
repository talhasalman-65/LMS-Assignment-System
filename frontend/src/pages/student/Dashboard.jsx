import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { formatDate, formatRelative } from '@/utils/format';
import {
  StatCard, Card, CardHeader, CardBody, Skeleton, EmptyState, Badge, StatusEdge,
} from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Upload, CheckSquare, Clock, ArrowRight,
} from 'lucide-react';

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const navigate = useNavigate();

  const assignmentsQuery = useQuery({
    queryKey: ['student-assignments', userId, 'active'],
    queryFn: () =>
      apiRequest('/assignments', {
        params: { studentId: userId, status: 'active', limit: 5 },
      }),
    enabled: !!userId,
  });

  const submissionsQuery = useQuery({
    queryKey: ['student-submissions', userId],
    queryFn: () =>
      apiRequest('/submissions', { params: { limit: 5 } }),
    enabled: !!userId,
  });

  const loading = assignmentsQuery.isLoading || submissionsQuery.isLoading;
  const assignments = assignmentsQuery.data?.assignments || [];
  const submissions = submissionsQuery.data?.submissions || [];

  const stats = loading ? null : {
    upcoming: assignments.length,
    submitted: submissions.filter((s) => s.status !== 'not_submitted').length,
    graded: submissions.filter((s) => s.status === 'graded').length,
    late: submissions.filter((s) => s.is_late).length,
  };

  const gradedSubs = submissions.filter((s) => s.status === 'graded');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="text-sm text-[var(--text-secondary)]">
          Welcome, {user?.fullName || user?.full_name || 'Student'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <Skeleton variant="stat" />
            <Skeleton variant="stat" />
            <Skeleton variant="stat" />
            <Skeleton variant="stat" />
          </>
        ) : (
          <>
            <StatCard icon={FileText} label="Upcoming" value={stats.upcoming} variant="primary" />
            <StatCard icon={Upload} label="Submitted" value={stats.submitted} variant="info" />
            <StatCard icon={CheckSquare} label="Graded" value={stats.graded} variant="success" />
            <StatCard icon={Clock} label="Late" value={stats.late} variant="warning" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">Upcoming Assignments</h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /><Skeleton variant="row" /></div>
            ) : assignments.length === 0 ? (
              <EmptyState icon={FileText} title="No upcoming assignments" description="You're all caught up!" />
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/app/student/assignments/${a.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                  >
                    <StatusEdge status={a.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.title}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Due {formatRelative(a.due_date)}
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-[var(--text-muted)] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">Recent Grades</h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
            ) : gradedSubs.length === 0 ? (
              <EmptyState icon={CheckSquare} title="No grades yet" description="Submitted assignments awaiting grading" />
            ) : (
              <div className="space-y-2">
                {gradedSubs.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[var(--border)]"
                  >
                    <StatusEdge status={s.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.assignment_title}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {formatDate(s.submitted_at)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-teal">
                        {s.marks ?? '-'}/{s.max_marks}
                      </div>
                      {s.grade && <Badge status={s.status} label={s.grade} />}
                    </div>
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
