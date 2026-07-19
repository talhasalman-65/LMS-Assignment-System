import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import {
  Card, CardBody, SearchInput, FilterSelect, Skeleton, EmptyState, StatusEdge, Badge, Button,
} from '@/components/ui';
import { FileText } from 'lucide-react';

export default function AdminAssignments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters = { page, limit: 20 };
  if (search) filters.search = search;
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-assignments', filters],
    queryFn: () => apiRequest('/assignments', { params: filters }),
    placeholderData: keepPreviousData,
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
        <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'expired', label: 'Expired' },
            { value: 'archived', label: 'Archived' },
          ]} placeholder="All Status"
        />
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : assignments.length === 0 ? (
            <EmptyState icon={FileText} title="No assignments found" />
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-3 py-3 rounded-md border border-[var(--border)]">
                  <StatusEdge status={a.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="flex gap-3 text-xs text-[var(--text-secondary)] mt-0.5">
                      <span>Due: {formatDate(a.due_date)}</span>
                      <span>Marks: {a.max_marks}</span>
                      <span className="capitalize">Type: {a.assignment_type}</span>
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          )}

          {pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">Page {pagination.page} of {pagination.totalPages}</span>
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
