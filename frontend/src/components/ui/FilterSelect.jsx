export default function FilterSelect({ label: _label, value, onChange, options, placeholder = 'All', className: _className }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-colors min-w-[140px]"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const lbl = typeof opt === 'string' ? opt : opt.label;
        return (
          <option key={val} value={val}>
            {lbl}
          </option>
        );
      })}
    </select>
  );
}
