import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { useUIStore } from '@/store/ui';
import { Card, CardBody, Button } from '@/components/ui';

export default function CreateAssignment() {
  const { edit } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const isEdit = !!edit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [assignmentType, setAssignmentType] = useState('homework');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [targetClass, setTargetClass] = useState('');
  const [targetStudents, setTargetStudents] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => apiRequest('/classes'),
  });

  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: () => apiRequest('/users', { params: { role: 'student', limit: 100 } }),
  });

  const editQuery = useQuery({
    queryKey: ['assignment', edit],
    queryFn: () => apiRequest(`/assignments/${edit}`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (editQuery.data) {
      const a = editQuery.data;
      setTitle(a.title || '');
      setDescription(a.description || '');
      setInstructions(a.instructions || '');
      setAssignmentType(a.assignment_type || 'homework');
      setDueDate(a.due_date ? a.due_date.slice(0, 16) : '');
      setMaxMarks(a.max_marks || 100);
      setMaxAttempts(a.max_attempts || 3);

      if (a.targets?.length > 0) {
        const classTarget = a.targets.find((t) => t.targetType === 'class');
        if (classTarget) setTargetClass(classTarget.targetId);
        const studentIds = a.targets
          .filter((t) => t.targetType === 'student')
          .map((t) => t.targetId);
        setTargetStudents(studentIds);
      }
    }
  }, [editQuery.data]);

  const createMutation = useMutation({
    mutationFn: (formData) =>
      isEdit
        ? apiRequest(`/assignments/${edit}`, { method: 'PUT', body: JSON.parse(formData.get('data') || '{}') })
        : apiRequest('/assignments', { method: 'POST', formData }),
    onSuccess: () => {
      addToast({ message: isEdit ? 'Assignment updated' : 'Assignment created', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      setTimeout(() => navigate('/app/teacher/assignments'), 1000);
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const targets = [];
    if (targetClass) targets.push({ targetType: 'class', targetId: parseInt(targetClass) });
    targetStudents.forEach((sid) => targets.push({ targetType: 'student', targetId: parseInt(sid) }));

    if (targets.length === 0) {
      addToast({ message: 'Select at least one class or student', type: 'warning' });
      return;
    }

    const data = {
      title,
      description,
      instructions,
      assignmentType,
      dueDate: new Date(dueDate).toISOString(),
      maxMarks: parseFloat(maxMarks),
      maxAttempts: parseInt(maxAttempts),
      targets,
    };

    if (isEdit) {
      createMutation.mutate(data);
    } else {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'targets') formData.append(k, JSON.stringify(v));
        else formData.append(k, v);
      });
      attachments.forEach((f) => formData.append('attachments', f));
      createMutation.mutate(formData);
    }
  };

  const classes = classesQuery.data || [];
  const students = studentsQuery.data?.users || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">{isEdit ? 'Edit Assignment' : 'Create New Assignment'}</h1>
      </div>

      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                required
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-vertical"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Assignment Type</label>
                <select
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                >
                  <option value="homework">Homework</option>
                  <option value="classwork">Classwork</option>
                  <option value="project">Project</option>
                  <option value="quiz">Quiz</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Due Date *</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Maximum Marks *</label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  min={1}
                  max={1000}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Max Attempts</label>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Target Class</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
              >
                <option value="">Select class (optional)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">Select a class or leave empty to assign to specific students</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Target Students</label>
              <select
                multiple
                value={targetStudents}
                onChange={(e) => setTargetStudents(Array.from(e.target.selectedOptions, (o) => o.value))}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal min-h-[100px]"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.roll_number || 'N/A'})
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">Hold Ctrl/Cmd to select multiple students</p>
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.zip"
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)]"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Allowed: PDF, DOCX, ZIP. Max 5MB each.</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={createMutation.isPending}>
              {isEdit ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
