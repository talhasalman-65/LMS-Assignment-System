import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import {
  Card, CardBody, SearchInput, FilterSelect, Skeleton, EmptyState, StatusEdge, Badge, Button,
} from '@/components/ui';
import { Inbox, ArrowRight } from 'lucide-react';

export default function TeacherSubmissions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters = { page, limit: 10 };
  if (search) filters.search = search;
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-submissions', filters],
    queryFn: () => apiRequest('/submissions', { params: filters }),
    placeholderData: keepPreviousData,
  });

  const submissions = data?.submissions || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Submissions</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search student or assignment..." />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={[
            { value: 'submitted', label: 'Submitted' },
            { value: 'under_review', label: 'Under Review' },
            { value: 'graded', label: 'Graded' },
            { value: 'returned_for_revision', label: 'Returned' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          placeholder="All Status"
        />
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : submissions.length === 0 ? (
            <EmptyState icon={Inbox} title="No submissions yet" />
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-3 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
                  <StatusEdge status={s.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.student_name} - {s.assignment_title}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Submitted: {formatDate(s.submitted_at)}
                      {s.version > 1 && ` (v${s.version})`}
                    </div>
                  </div>
                  <Badge status={s.status} />
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/app/teacher/grade-center/${s.id}`)} iconOnly>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">
                Page {pagination.page} of {pagination.totalPages}
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
