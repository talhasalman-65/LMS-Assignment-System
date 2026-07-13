import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import { formatDate } from '@/utils/format';
import { Card, CardBody, Skeleton, EmptyState, Button } from '@/components/ui';
import { createStatusColumn } from '@/components/ui/Table';
import { CheckSquare } from 'lucide-react';
import {
  flexRender, getCoreRowModel, useReactTable,
} from '@tanstack/react-table';

export default function GradeCenter() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['grade-center'],
    queryFn: () => apiRequest('/submissions', { params: { limit: 50 } }),
  });

  const submissions = data?.submissions || [];

  const columns = [
    { accessorKey: 'student_name', header: 'Student', enableSorting: true },
    { accessorKey: 'assignment_title', header: 'Assignment', enableSorting: true },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
      enableSorting: true,
      cell: ({ row }) => formatDate(row.getValue('submitted_at')),
    },
    createStatusColumn('status', 'Status'),
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => {
        const m = row.getValue('marks');
        const max = row.original.max_marks;
        return m !== null && m !== undefined ? `${m}/${max}` : '-';
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/app/teacher/grade-center/${row.original.id}`)}
        >
          Grade
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Grade Center</h1>
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : submissions.length === 0 ? (
            <EmptyState icon={CheckSquare} title="No submissions to grade" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th key={h.id} className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-app)] border-b border-[var(--border)] font-semibold whitespace-nowrap">
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border)] last:border-b-0">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
