import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { formatDate, formatFileSize } from '@/utils/format';
import { useUIStore } from '@/store/ui';
import {
  Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState,
} from '@/components/ui';
import { ArrowLeft, File, Download } from 'lucide-react';

export default function GradeSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [gradeAction, setGradeAction] = useState('graded');

  const subQuery = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => apiRequest(`/submissions/${submissionId}`),
    enabled: !!submissionId,
  });

  const assignmentQuery = useQuery({
    queryKey: ['assignment-for-grade', subQuery.data?.assignment_id],
    queryFn: () => apiRequest(`/assignments/${subQuery.data.assignment_id}`),
    enabled: !!subQuery.data?.assignment_id,
  });

  const historyQuery = useQuery({
    queryKey: ['submission-history', subQuery.data?.assignment_id, subQuery.data?.student_id],
    queryFn: () => apiRequest('/submissions', {
      params: { assignmentId: subQuery.data.assignment_id, studentId: subQuery.data.student_id, limit: 10 },
    }),
    enabled: !!subQuery.data?.assignment_id && !!subQuery.data?.student_id,
  });

  const gradeMutation = useMutation({
    mutationFn: (data) => apiRequest(`/submissions/${submissionId}/grade`, { method: 'POST', body: data }),
    onSuccess: () => {
      addToast({ message: 'Grade submitted', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['grade-center'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const finalizeMutation = useMutation({
    mutationFn: () => apiRequest(`/submissions/${submissionId}/finalize`, { method: 'POST' }),
    onSuccess: () => {
      addToast({ message: 'Grade finalized', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const sub = subQuery.data;
  const assignment = assignmentQuery.data;
  const history = historyQuery.data?.submissions || [];

  if (subQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="title" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <EmptyState
        icon={File}
        title="Submission not found"
        action={
          <Button variant="secondary" onClick={() => navigate('/app/teacher/grade-center')}>
            Back to Grade Center
          </Button>
        }
      />
    );
  }

  const handleGrade = (e) => {
    e.preventDefault();
    const m = parseFloat(marks);
    if (m > assignment.max_marks) {
      addToast({ message: `Marks cannot exceed ${assignment.max_marks}`, type: 'warning' });
      return;
    }
    gradeMutation.mutate({ marks: m, feedback, reviewNotes, status: gradeAction });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/teacher/grade-center')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-bold">Grade Submission</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Submission Info</h3></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><div className="text-xs text-[var(--text-secondary)]">Student</div><div className="text-sm font-medium">{sub.student_name}</div></div>
              <div><div className="text-xs text-[var(--text-secondary)]">Assignment</div><div className="text-sm font-medium">{sub.assignment_title}</div></div>
              <div><div className="text-xs text-[var(--text-secondary)]">Submitted</div><div className="text-sm">{formatDate(sub.submitted_at)}</div></div>
              <div><div className="text-xs text-[var(--text-secondary)]">Status</div><div><Badge status={sub.status} /></div></div>
              <div><div className="text-xs text-[var(--text-secondary)]">Version</div><div className="text-sm">{sub.version}</div></div>
              <div><div className="text-xs text-[var(--text-secondary)]">Late</div><div className="text-sm">{sub.is_late ? 'Yes' : 'No'}</div></div>
            </div>

            {sub.files?.length > 0 && (
              <div>
                <div className="text-xs text-[var(--text-secondary)] font-medium mb-2">Submitted Files</div>
                <div className="space-y-1.5">
                  {sub.files.map((f, i) => {
                    const fileUrl = '/api/files/submission/' + f.id;
                    return (
                      <a key={i} href={fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors text-sm"
                      >
                        <File size={15} className="text-[var(--text-muted)] shrink-0" />
                        <span className="flex-1 truncate font-medium">{f.fileName}</span>
                        <span className="text-xs text-[var(--text-muted)]">{formatFileSize(f.fileSize)}</span>
                        <Download size={14} className="text-[var(--text-muted)] shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Grade & Feedback</h3></CardHeader>
          <CardBody>
            <form onSubmit={handleGrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Marks (Max: {assignment?.max_marks})
                </label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  min={0}
                  max={assignment?.max_marks}
                  step={0.5}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Review Notes (internal)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-vertical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Action</label>
                <select
                  value={gradeAction}
                  onChange={(e) => setGradeAction(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                >
                  <option value="graded">Grade & Finalize</option>
                  <option value="returned_for_revision">Return for Revision</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" loading={gradeMutation.isPending}>
                  Submit Grade
                </Button>
                {sub.status === 'under_review' && (
                  <Button
                    type="button"
                    variant="success"
                    onClick={() => finalizeMutation.mutate()}
                    loading={finalizeMutation.isPending}
                  >
                    Finalize Only
                  </Button>
                )}
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader><h3 className="text-sm font-semibold">Submission History</h3></CardHeader>
        <CardBody>
          {history.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No history</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between px-3 py-2 rounded-md border border-[var(--border)] text-sm">
                  <span className="font-medium">Version {h.version}</span>
                  <Badge status={h.status} />
                  <span className="text-[var(--text-secondary)]">{formatDate(h.submitted_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
