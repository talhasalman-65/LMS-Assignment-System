import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import {
  Card, CardBody, SearchInput, Skeleton, EmptyState, StatusEdge, Badge, Button,
} from '@/components/ui';
import { GraduationCap } from 'lucide-react';

export default function StudentGrades() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filters = { page, limit: 20 };
  if (search) filters.search = search;

  const { data, isLoading } = useQuery({
    queryKey: ['student-grades', filters],
    queryFn: () => apiRequest('/submissions', { params: filters }),
  });

  const submissions = data?.submissions || [];
  const graded = submissions.filter((s) => s.status === 'graded');
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Grades & Feedback</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by assignment..." />
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : graded.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No grades yet"
              description="Submitted assignments will appear here once graded"
            />
          ) : (
            <div className="space-y-2">
              {graded.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-3 rounded-md border border-[var(--border)]">
                  <StatusEdge status={s.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.assignment_title}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Submitted: {formatDate(s.submitted_at)}
                    </div>
                    {s.feedback && (
                      <div className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{s.feedback}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-teal">
                      {s.marks ?? '-'} / {s.max_marks}
                    </div>
                    {s.grade && <Badge status={s.status} label={s.grade} />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-1">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
