import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pageIndex, pageCount, pageSize, onPageChange, onPageSizeChange }) {
  if (pageCount <= 1 && !onPageSizeChange) return null;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span>Rows per page:</span>
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-card)] text-sm"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-medium">{pageSize}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex <= 0}
          className="p-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="px-3 text-sm text-[var(--text-secondary)]">
          Page {pageIndex + 1} of {pageCount}
        </span>

        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
          className="p-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
