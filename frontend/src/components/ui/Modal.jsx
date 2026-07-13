import { useEffect, useRef } from 'react';
import { cn } from '@/utils/helpers';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, className }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <div
        className={cn(
          'bg-[var(--bg-card)] rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
