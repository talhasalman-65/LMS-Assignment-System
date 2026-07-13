import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { cn } from '@/utils/helpers';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Pagination from './Pagination';

function SortHeader({ column, children }) {
  const sorted = column.getIsSorted();
  return (
    <button
      className="inline-flex items-center gap-1 font-semibold hover:text-[var(--text-primary)] transition-colors"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      {sorted === 'asc' ? <ArrowUp size={13} /> : sorted === 'desc' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} className="opacity-30" />}
    </button>
  );
}

export default function Table({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  globalFilter,
  onGlobalFilterChange,
  loading = false,
  emptyMessage = 'No data found',
  className,
}) {
  const [sorting, setSorting] = useState([]);

  const resolvedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        header: col.enableSorting !== false ? () => <SortHeader column={col}>{col.header}</SortHeader> : col.header,
      })),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    state: { sorting, globalFilter, pagination: { pageIndex: pageIndex || 0, pageSize: pageSize || 20 } },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount,
  });

  if (loading) {
    return (
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-[var(--border)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border border-[var(--border)] rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-app)] border-b border-[var(--border)] font-semibold whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border)] last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(pageCount > 1 || onPageSizeChange) && (
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-app)]">
          <Pagination
            pageIndex={pageIndex || 0}
            pageCount={pageCount || 1}
            pageSize={pageSize || 20}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}

export function createStatusColumn(accessorKey = 'status', header = 'Status') {
  return {
    accessorKey,
    header,
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue(accessorKey);
      const label = (status || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const colorMap = {
        not_submitted: 'bg-danger/10 text-danger',
        submitted: 'bg-brass/10 text-brass',
        under_review: 'bg-brass/10 text-brass',
        graded: 'bg-info/10 text-info',
        returned_for_revision: 'bg-brass/10 text-brass',
        rejected: 'bg-danger/10 text-danger',
        active: 'bg-success/10 text-success',
        due_soon: 'bg-brass/10 text-brass',
        expired: 'bg-danger/10 text-danger',
        archived: 'bg-muted/10 text-muted',
        draft: 'bg-muted/10 text-muted',
        completed: 'bg-success/10 text-success',
        approved: 'bg-success/10 text-success',
        missing: 'bg-danger/10 text-danger',
      };

      const edgeMap = {
        not_submitted: 'bg-danger',
        submitted: 'bg-brass',
        under_review: 'bg-brass',
        graded: 'bg-info',
        returned_for_revision: 'bg-brass',
        rejected: 'bg-danger',
        active: 'bg-success',
        due_soon: 'bg-brass',
        expired: 'bg-danger',
        archived: 'bg-muted',
        draft: 'bg-muted',
        completed: 'bg-success',
        approved: 'bg-success',
        missing: 'bg-danger',
      };

      return (
        <div className="flex items-center gap-2">
          <div className={cn('w-[3px] h-4 rounded-r', edgeMap[status] || 'bg-muted')} />
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', colorMap[status] || 'bg-muted/10 text-muted')}>
            {label}
          </span>
        </div>
      );
    },
  };
}
