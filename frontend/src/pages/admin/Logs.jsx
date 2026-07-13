import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import { Card, CardBody, SearchInput, Skeleton, EmptyState, Button } from '@/components/ui';
import { ClipboardList } from 'lucide-react';

export default function AdminLogs() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filters = { page, limit: 30 };
  if (search) filters.search = search;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', filters],
    queryFn: () => apiRequest('/logs', { params: filters }),
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">System Logs</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search logs..." />
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No logs found" />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {logs.map((l, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-[var(--bg-hover)] transition-colors">
                  <span className="text-xs font-mono text-[var(--text-muted)] w-16 shrink-0">
                    {l.level || 'INFO'}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-medium">{l.action}</span>
                    {l.entity_type && (
                      <span className="text-[var(--text-muted)]"> ({l.entity_type})</span>
                    )}
                    {l.details && (
                      <span className="text-[var(--text-muted)] block text-xs truncate">{l.details}</span>
                    )}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] shrink-0 whitespace-nowrap">
                    {formatDate(l.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
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
