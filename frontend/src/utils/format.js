import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return format(d, 'MMM d, yyyy HH:mm');
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return format(d, 'MMM d, yyyy');
}

export function formatRelative(dateStr) {
  if (!dateStr) return '-';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function highlightText(text, query) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-brass/20 text-inherit rounded-sm px-0.5">$1</mark>');
}
