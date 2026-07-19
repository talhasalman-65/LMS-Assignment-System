import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { useUIStore } from '@/store/ui';
import {
  Card, CardBody, SearchInput, FilterSelect, Skeleton, EmptyState, Button, Modal, ConfirmDialog,
} from '@/components/ui';
import { Users as UsersIcon, PlusCircle } from 'lucide-react';

const ROLE_COLORS = {
  student: 'text-info bg-info/10',
  teacher: 'text-success bg-success/10',
  administrator: 'text-teal bg-teal/10',
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filters = { page, limit: 20 };
  if (search) filters.search = search;
  if (roleFilter) filters.role = roleFilter;
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => apiRequest('/users', { params: filters }),
    placeholderData: keepPreviousData,
  });

  const classesQuery = useQuery({ queryKey: ['classes'], queryFn: () => apiRequest('/classes') });
  const sectionsQuery = useQuery({ queryKey: ['sections'], queryFn: () => apiRequest('/sections') });

  const users = data?.users || [];
  const pagination = data?.pagination;
  const classes = classesQuery.data || [];
  const sections = sectionsQuery.data || [];

  // Create user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [newRollNumber, setNewRollNumber] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newSection, setNewSection] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('/users', { method: 'POST', body: data }),
    onSuccess: () => {
      addToast({ message: 'User created', type: 'success' });
      setShowCreateModal(false);
      resetCreateForm();
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest(`/users/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      addToast({ message: 'User updated', type: 'success' });
      setEditUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      addToast({ message: 'User deleted', type: 'success' });
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => apiRequest(`/users/${id}/suspend`, { method: 'POST' }),
    onSuccess: () => {
      addToast({ message: 'User suspended', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => apiRequest(`/users/${id}/activate`, { method: 'POST' }),
    onSuccess: () => {
      addToast({ message: 'User activated', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const resetPwdMutation = useMutation({
    mutationFn: ({ userId, password }) => apiRequest('/auth/reset-password', { method: 'POST', body: { userId, password } }),
    onSuccess: () => addToast({ message: 'Password reset', type: 'success' }),
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  function resetCreateForm() {
    setNewName(''); setNewEmail(''); setNewRole('student');
    setNewRollNumber(''); setNewRegNumber(''); setNewClass(''); setNewSection('');
    setNewEmployeeId(''); setNewDepartment(''); setNewPhone(''); setNewPassword('');
  }

  const handleCreate = (e) => {
    e.preventDefault();
    const data = {
      fullName: newName, email: newEmail, role: newRole,
      phoneNumber: newPhone, password: newPassword || undefined,
    };
    if (newRole === 'student') {
      data.rollNumber = newRollNumber;
      data.registrationNumber = newRegNumber;
      data.classId = parseInt(newClass) || undefined;
      data.sectionId = parseInt(newSection) || undefined;
    } else if (newRole === 'teacher') {
      data.employeeId = newEmployeeId;
      data.department = newDepartment;
    }
    createMutation.mutate(data);
  };

  const handleEdit = (u) => setEditUser({ ...u, editName: u.full_name, editEmail: u.email, editStatus: u.status, editPhone: u.phone_number || '' });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: editUser.id,
      data: {
        fullName: editUser.editName, email: editUser.editEmail,
        status: editUser.editStatus, phoneNumber: editUser.editPhone,
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Users</h1>
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <PlusCircle size={15} />
          Create User
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." />
        <FilterSelect value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }}
          options={[
            { value: 'student', label: 'Student' },
            { value: 'teacher', label: 'Teacher' },
            { value: 'administrator', label: 'Administrator' },
          ]} placeholder="All Roles"
        />
        <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
          ]} placeholder="All Status"
        />
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : users.length === 0 ? (
            <EmptyState icon={UsersIcon} title="No users found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-app)] border-b border-[var(--border)] font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-app)] border-b border-[var(--border)] font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-app)] border-b border-[var(--border)] font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-app)] border-b border-[var(--border)] font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-app)] border-b border-[var(--border)] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border)]">
                      <td className="px-4 py-3 font-medium">{u.full_name}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ''}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status === 'active' ? 'bg-success/10 text-success' :
                          u.status === 'suspended' ? 'bg-danger/10 text-danger' : 'bg-muted/10 text-muted'
                        }`}>{u.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>Edit</Button>
                          {u.status === 'suspended' ? (
                            <Button variant="success" size="sm" onClick={() => activateMutation.mutate(u.id)}>Activate</Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => suspendMutation.mutate(u.id)}>Suspend</Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => {
                            const pwd = window.prompt('Enter new password (min 8 chars):', 'Password1');
                            if (pwd) resetPwdMutation.mutate({ userId: u.id, password: pwd });
                          }}>Reset Pwd</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Full Name *</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" required /></div>
          <div><label className="block text-sm font-medium mb-1.5">Email *</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" required /></div>
          <div><label className="block text-sm font-medium mb-1.5">Role *</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="administrator">Administrator</option>
            </select></div>

          {newRole === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1">Roll Number</label>
                  <input type="text" value={newRollNumber} onChange={(e) => setNewRollNumber(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" /></div>
                <div><label className="block text-xs font-medium mb-1">Registration No.</label>
                  <input type="text" value={newRegNumber} onChange={(e) => setNewRegNumber(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1">Class</label>
                  <select value={newClass} onChange={(e) => setNewClass(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]">
                    <option value="">Select</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select></div>
                <div><label className="block text-xs font-medium mb-1">Section</label>
                  <select value={newSection} onChange={(e) => setNewSection(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]">
                    <option value="">Select</option>
                    {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
              </div>
            </>
          )}

          {newRole === 'teacher' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Employee ID</label>
                <input type="text" value={newEmployeeId} onChange={(e) => setNewEmployeeId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" /></div>
              <div><label className="block text-xs font-medium mb-1">Department</label>
                <input type="text" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" /></div>
            </div>
          )}

          <div><label className="block text-sm font-medium mb-1.5">Phone Number</label>
            <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Password (default: Password1)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank for default" className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" /></div>
          <Button type="submit" className="w-full" loading={createMutation.isPending}>Create User</Button>
        </form>
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <input type="hidden" value={editUser.id} />
            <div><label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input type="text" value={editUser.editName} onChange={(e) => setEditUser({ ...editUser, editName: e.target.value })} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" required /></div>
            <div><label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={editUser.editEmail} onChange={(e) => setEditUser({ ...editUser, editEmail: e.target.value })} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" required /></div>
            <div><label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={editUser.editStatus} onChange={(e) => setEditUser({ ...editUser, editStatus: e.target.value })} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input type="text" value={editUser.editPhone} onChange={(e) => setEditUser({ ...editUser, editPhone: e.target.value })} className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)]" /></div>
            <div className="flex gap-2">
              <Button type="submit" loading={updateMutation.isPending}>Update User</Button>
              <Button type="button" variant="danger" onClick={() => { setDeleteTarget(editUser); setEditUser(null); }}>Delete User</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete User"
        message={`Delete "${deleteTarget?.editName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
