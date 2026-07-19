import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import { useUIStore } from '@/store/ui';
import {
  Card, CardBody, SearchInput, FilterSelect, Skeleton, EmptyState, StatusEdge, Badge, Button, ConfirmDialog,
} from '@/components/ui';
import { FileText, PlusCircle, Pencil, Trash2 } from 'lucide-react';

export default function TeacherAssignments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filters = { page, limit: 10 };
  if (search) filters.search = search;
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-assignments', filters],
    queryFn: () => apiRequest('/assignments', { params: filters }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest(`/assignments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast({ message: 'Assignment deleted', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      setDeleteTarget(null);
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const assignments = data?.assignments || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Assignments</h1>
        <Button size="sm" onClick={() => navigate('/app/teacher/create-assignment')}>
          <PlusCircle size={15} />
          Create Assignment
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search assignments..." />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'expired', label: 'Expired' },
            { value: 'archived', label: 'Archived' },
          ]}
          placeholder="All Status"
        />
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : assignments.length === 0 ? (
            <EmptyState icon={FileText} title="No assignments yet" description="Create your first assignment to get started"
              action={<Button size="sm" onClick={() => navigate('/app/teacher/create-assignment')}>Create Assignment</Button>}
            />
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-3 py-3 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors">
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
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/app/teacher/create-assignment/${a.id}`)} iconOnly>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(a)} iconOnly>
                    <Trash2 size={14} className="text-danger" />
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Assignment"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
