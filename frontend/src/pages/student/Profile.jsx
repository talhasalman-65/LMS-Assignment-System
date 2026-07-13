import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { Card, CardHeader, CardBody, Button } from '@/components/ui';
import { User, Mail, Shield, Hash, BookOpen, Users } from 'lucide-react';

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
      <div className="w-8 h-8 rounded-md bg-[var(--bg-app)] flex items-center justify-center shrink-0">
        <Icon size={15} className="text-[var(--text-secondary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--text-secondary)]">{label}</div>
        <div className="text-sm font-medium truncate">{value || '-'}</div>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const addToast = useUIStore((s) => s.addToast);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');

  const updateMutation = useMutation({
    mutationFn: (data) =>
      apiRequest(`/users/${user.id}`, { method: 'PUT', body: data }),
    onSuccess: (updatedUser) => {
      setUser({ ...user, ...updatedUser });
      addToast({ message: 'Profile updated', type: 'success' });
      setEditing(false);
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const handleSave = () => {
    updateMutation.mutate({ fullName, phoneNumber });
  };

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Profile</h1>
        <Button
          variant={editing ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => {
            if (editing) {
              setFullName(user.fullName || user.full_name || '');
              setPhoneNumber(user.phone_number || '');
            }
            setEditing(!editing);
          }}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardBody className="text-center">
            <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-teal">
                {(user.fullName || user.full_name || '?')
                  .split(' ')
                  .map((s) => s[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <h2 className="text-base font-semibold">{user.fullName || user.full_name}</h2>
            <p className="text-sm text-[var(--text-secondary)] capitalize">{user.role}</p>
            {user.email && (
              <p className="text-xs text-[var(--text-muted)] mt-1">{user.email}</p>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold">Account Details</h3>
          </CardHeader>
          <CardBody className="space-y-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)]"
                  />
                </div>
                <Button onClick={handleSave} loading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            ) : (
              <>
                <DetailRow icon={User} label="Full Name" value={user.fullName || user.full_name} />
                <DetailRow icon={Mail} label="Email" value={user.email} />
                <DetailRow icon={Shield} label="Role" value={user.role} />
                <DetailRow icon={Hash} label="Roll Number" value={user.roll_number} />
                <DetailRow icon={BookOpen} label="Registration Number" value={user.registration_number} />
                <DetailRow icon={Users} label="Phone" value={user.phone_number} />
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
