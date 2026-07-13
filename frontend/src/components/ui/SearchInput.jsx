import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '@/utils/helpers';

export default function SearchInput({ value: externalValue, onChange, placeholder = 'Search...', debounceMs = 300 }) {
  const [localValue, setLocalValue] = useState(externalValue || '');

  useEffect(() => {
    setLocalValue(externalValue || '');
  }, [externalValue]);

  const debouncedOnChange = debounce((val) => {
    onChange?.(val);
  }, debounceMs);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    debouncedOnChange(val);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-colors"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
