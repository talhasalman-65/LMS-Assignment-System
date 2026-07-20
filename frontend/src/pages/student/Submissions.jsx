import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import {
  Card, CardBody, SearchInput, FilterSelect, Skeleton, EmptyState, StatusEdge, Badge, Button,
} from '@/components/ui';
import { Upload } from 'lucide-react';

export default function StudentSubmissions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters = { page, limit: 10 };
  if (search) filters.search = search;
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['student-submissions', filters],
    queryFn: () => apiRequest('/submissions', { params: filters }),
    placeholderData: keepPreviousData,
  });

  const submissions = data?.submissions || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">My Submissions</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by assignment..." />
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
            <EmptyState
              icon={Upload}
              title="No submissions yet"
              description="Submit your assignments to see them here"
            />
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-start gap-3 px-3 py-3 rounded-md border border-[var(--border)]">
                  <StatusEdge status={s.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.assignment_title}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Submitted: {formatDate(s.submitted_at)}
                    </div>
                    {s.files?.length > 0 && (
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {s.files.map((f, i) => {
                          const fileUrl = '/api/files/submission/' + f.id;
                          return (
                            <a
                              key={i}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal hover:underline"
                            >
                              {f.fileName}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.is_late && <span className="text-xs font-semibold text-brass">Late</span>}
                    <Badge status={s.status} />
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
