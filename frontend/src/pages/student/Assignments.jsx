import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/utils/format';
import {
  Card, CardBody, SearchInput, FilterSelect, Skeleton, EmptyState, StatusEdge, Button,
} from '@/components/ui';
import { FileText, ArrowRight } from 'lucide-react';

export default function StudentAssignments() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters = { studentId: userId, page, limit: 10 };
  if (search) filters.search = search;
  if (statusFilter) filters.status = statusFilter;
  if (typeFilter) filters.type = typeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['student-assignments', userId, filters],
    queryFn: () => apiRequest('/assignments', { params: filters }),
    placeholderData: keepPreviousData,
    enabled: !!userId,
  });

  const assignments = data?.assignments || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Assignments</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search assignments..." />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'due_soon', label: 'Due Soon' },
            { value: 'expired', label: 'Expired' },
          ]}
          placeholder="All Status"
        />
        <FilterSelect
          value={typeFilter}
          onChange={(v) => { setTypeFilter(v); setPage(1); }}
          options={[
            { value: 'homework', label: 'Homework' },
            { value: 'classwork', label: 'Classwork' },
            { value: 'project', label: 'Project' },
          ]}
          placeholder="All Types"
        />
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton variant="row" />
              <Skeleton variant="row" />
              <Skeleton variant="row" />
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No assignments found"
              description="There are no assignments matching your criteria"
            />
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => {
                const subStatus = a.submission_status || 'not_submitted';
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-3 py-3 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <StatusEdge status={a.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="flex gap-3 text-xs text-[var(--text-secondary)] mt-0.5">
                        <span>Due: {formatDate(a.due_date)}</span>
                        <span>Marks: {a.max_marks}</span>
                        {a.is_late && (
                          <span className="text-brass font-semibold">Late</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusEdge status={subStatus} />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/app/student/assignments/${a.id}`)}
                        iconOnly
                      >
                        <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
