import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { formatDate, formatFileSize } from '@/utils/format';
import {
  Card, CardHeader, CardBody, Button, Badge, StatusEdge, Skeleton, EmptyState, FileUpload,
} from '@/components/ui';
import { useUIStore } from '@/store/ui';
import { ArrowLeft, File, Download, Award, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const [files, setFiles] = useState([]);

  const assignmentQuery = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => apiRequest(`/assignments/${id}`),
    enabled: !!id,
  });

  const submissionsQuery = useQuery({
    queryKey: ['submissions-history', id],
    queryFn: () => apiRequest(`/submissions/${id}/history`),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (formData) =>
      apiRequest(`/submissions/${id}/submit`, { method: 'POST', formData }),
    onSuccess: () => {
      addToast({ message: 'Assignment submitted successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['submissions-history', id] });
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
      setFiles([]);
    },
    onError: (err) => {
      addToast({ message: err.message, type: 'error' });
    },
  });

  const assignment = assignmentQuery.data;
  const submissions = submissionsQuery.data || [];
  const latestSub = submissions.length > 0 ? submissions[submissions.length - 1] : null;
  const loading = assignmentQuery.isLoading;

  const canSubmit =
    assignment &&
    (assignment.status === 'Active' || assignment.status === 'Due Soon') &&
    submissions.length < (assignment.max_attempts || 3);

  const handleSubmit = () => {
    if (files.length === 0) {
      addToast({ message: 'Please select files to upload', type: 'warning' });
      return;
    }
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    submitMutation.mutate(formData);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="title" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <EmptyState
        icon={File}
        title="Assignment not found"
        description="This assignment may have been removed"
        action={<Button variant="secondary" onClick={() => navigate('/app/student/assignments')}>Back to Assignments</Button>}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/student/assignments')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-bold flex-1">{assignment.title}</h1>
        <Badge status={assignment.status} />
      </div>

      {/* Details Card */}
      <Card className="mb-5">
        <CardHeader><h3 className="text-sm font-semibold">Assignment Details</h3></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Due Date</div>
              <div className="text-sm font-medium">{formatDate(assignment.due_date)}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Max Marks</div>
              <div className="text-sm font-medium">{assignment.max_marks}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Type</div>
              <div className="text-sm font-medium capitalize">{assignment.assignment_type}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">Max Attempts</div>
              <div className="text-sm font-medium">{assignment.max_attempts}</div>
            </div>
          </div>

          {assignment.description && (
            <div className="mb-3">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Description</div>
              <p className="text-sm text-[var(--text-primary)]">{assignment.description}</p>
            </div>
          )}

          {assignment.instructions && (
            <div className="mb-3">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Instructions</div>
              <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{assignment.instructions}</p>
            </div>
          )}

          {assignment.attachments?.length > 0 && (
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-2">Attachments</div>
              <div className="space-y-1.5">
                {assignment.attachments.map((f, i) => {
                  const fileUrl = '/api/files/attachment/' + f.id;
                  return (
                    <a
                      key={i}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
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

      {/* Submissions Card */}
      <Card className="mb-5">
        <CardHeader>
          <h3 className="text-sm font-semibold">
            Your Submissions ({submissions.length}/{assignment.max_attempts})
          </h3>
        </CardHeader>
        <CardBody>
          {submissions.length === 0 ? (
            <EmptyState
              icon={File}
              title="No submissions yet"
              description="Submit your work for this assignment"
            />
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-md border border-[var(--border)]"
                >
                  <StatusEdge status={s.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Version {s.version}</span>
                      {s.is_late && (
                        <span className="text-xs font-semibold text-brass">Late</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {formatDate(s.submitted_at)}
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
                  <Badge status={s.status} />
                </div>
              ))}
            </div>
          )}

          {canSubmit && (
            <div className="mt-5 pt-4 border-t border-[var(--border)]">
              <h4 className="text-sm font-semibold mb-3">Submit Assignment</h4>
              <FileUpload
                accept=".pdf,.docx,.zip"
                maxFiles={5}
                maxSizeMB={5}
                onFilesChange={setFiles}
              />
              <div className="mt-3">
                <Button onClick={handleSubmit} loading={submitMutation.isPending}>
                  Submit Assignment
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Grade Card */}
      {latestSub && latestSub.status === 'graded' && (
        <Card>
          <CardHeader><h3 className="text-sm font-semibold">Grade & Feedback</h3></CardHeader>
          <CardBody>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center">
                <Award size={28} className="text-teal" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Marks</div>
                <div className="text-2xl font-bold text-teal">
                  {latestSub.marks ?? '-'} / {assignment.max_marks}
                </div>
                {latestSub.grade && (
                  <Badge status={latestSub.status} label={latestSub.grade} />
                )}
              </div>
            </div>
            {latestSub.feedback && (
              <div className="p-3 rounded-md bg-[var(--bg-app)]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  <MessageSquare size={13} />
                  Feedback
                </div>
                <p className="text-sm">{latestSub.feedback}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
