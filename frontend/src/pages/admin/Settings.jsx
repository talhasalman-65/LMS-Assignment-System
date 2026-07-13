import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { useUIStore } from '@/store/ui';
import { Card, CardHeader, CardBody, Skeleton, Button } from '@/components/ui';
import { useState } from 'react';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  const [settingsValues, setSettingsValues] = useState({});

  const { data: _settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiRequest('/settings'),
    onSuccess: (data) => {
      const vals = {};
      data.forEach((s) => { vals[s.key] = s.value; });
      setSettingsValues(vals);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (settings) =>
      apiRequest('/settings/bulk', { method: 'PUT', body: { settings } }),
    onSuccess: () => {
      addToast({ message: 'Settings saved', type: 'success' });
      queryClient.invalidateQueries({ key: ['settings'] });
    },
    onError: (err) => addToast({ message: err.message, type: 'error' }),
  });

  const handleSave = () => {
    const entries = Object.entries(settingsValues).map(([key, value]) => ({ key, value }));
    saveMutation.mutate(entries);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">System Settings</h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader><h3 className="text-sm font-semibold">Configuration</h3></CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="space-y-4"><Skeleton variant="row" /><Skeleton variant="row" /></div>
          ) : (
            <div className="space-y-4">
              {Object.entries(settingsValues).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1.5 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setSettingsValues({ ...settingsValues, [key]: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                  />
                </div>
              ))}
              <Button onClick={handleSave} loading={saveMutation.isPending}>
                Save Settings
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
