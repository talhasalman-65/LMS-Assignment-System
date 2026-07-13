import { useState, useRef } from 'react';
import { cn } from '@/utils/helpers';
import { formatFileSize } from '@/utils/format';
import { Upload, File, X, AlertCircle } from 'lucide-react';

export default function FileUpload({ accept, multiple = true, maxFiles = 5, maxSizeMB = 5, onFilesChange }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (fileList) => {
    setError('');
    const newFiles = Array.from(fileList);
    const maxSize = maxSizeMB * 1024 * 1024;

    const invalid = newFiles.find((f) => f.size > maxSize);
    if (invalid) {
      setError(`${invalid.name} exceeds ${maxSizeMB}MB limit`);
      return;
    }

    const combined = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(combined);
    onFilesChange?.(combined);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragging ? 'border-teal bg-teal/5' : 'border-[var(--border)] hover:border-teal/50 hover:bg-[var(--bg-hover)]'
        )}
      >
        <Upload size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Max {maxFiles} files, {maxSizeMB}MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { processFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 px-3 py-2 rounded-md border border-[var(--border)] text-sm"
            >
              <File size={16} className="text-[var(--text-muted)] shrink-0" />
              <span className="flex-1 truncate font-medium">{file.name}</span>
              <span className="text-xs text-[var(--text-muted)] shrink-0">{formatFileSize(file.size)}</span>
              <button
                onClick={() => removeFile(i)}
                className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-danger transition-colors"
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
