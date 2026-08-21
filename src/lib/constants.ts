import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from '@/lib/supabase';

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  academic: 'Academic',
  facilities: 'Facilities',
  hostel: 'Hostel',
  mess: 'Mess / Cafeteria',
  administration: 'Administration',
  harassment: 'Harassment',
  other: 'Other',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as ComplaintCategory,
  label,
}));

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const STATUS_STYLES: Record<ComplaintStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-200 text-gray-600 border-gray-300',
};

export const STATUS_DOT: Record<ComplaintStatus, string> = {
  pending: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  resolved: 'bg-emerald-500',
  closed: 'bg-gray-400',
};

export const PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_STYLES: Record<ComplaintPriority, string> = {
  low: 'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-sky-100 text-sky-700 border-sky-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}
