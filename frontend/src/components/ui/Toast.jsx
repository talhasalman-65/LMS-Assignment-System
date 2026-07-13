import { useEffect } from 'react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/utils/helpers';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: { icon: CheckCircle, bg: 'bg-success/10 text-success border-l-success border-l-4' },
  error: { icon: XCircle, bg: 'bg-danger/10 text-danger border-l-danger border-l-4' },
  warning: { icon: AlertTriangle, bg: 'bg-brass/10 text-brass border-l-brass border-l-4' },
  info: { icon: Info, bg: 'bg-info/10 text-info border-l-info border-l-4' },
};

function ToastItem({ id, message, type }) {
  const removeToast = useUIStore((s) => s.removeToast);
  const { icon: Icon, bg } = config[type] || config.info;

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 4000);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <div className={cn('flex items-center gap-2.5 px-4 py-3 rounded-md shadow-md text-sm min-w-[300px] max-w-[450px]', bg)}>
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={() => removeToast(id)} className="shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
