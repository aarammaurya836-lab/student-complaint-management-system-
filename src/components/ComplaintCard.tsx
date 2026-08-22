import type { Complaint } from '@/lib/supabase';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { CATEGORY_LABELS, timeAgo } from '@/lib/constants';
import { MessageSquare } from 'lucide-react';

type Props = {
  complaint: Complaint;
  onClick: () => void;
  responseCount?: number;
  showStudent?: boolean;
  showAssignee?: boolean;
};

export function ComplaintCard({ complaint, onClick, responseCount, showStudent, showAssignee }: Props) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-sky-300 hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-700">
          {complaint.title}
        </h3>
        <span className="shrink-0 text-xs text-slate-400">{timeAgo(complaint.created_at)}</span>
      </div>

      <p className="mb-3 line-clamp-2 text-xs text-slate-500">{complaint.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
          {CATEGORY_LABELS[complaint.category]}
        </span>
        {showStudent && complaint.student && (
          <span className="text-xs text-slate-400">by {complaint.student.full_name}</span>
        )}
        {showAssignee && (
          <span className="text-xs text-slate-400">
            {complaint.assignee ? `Assigned: ${complaint.assignee.full_name}` : 'Unassigned'}
          </span>
        )}
        {responseCount !== undefined && responseCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MessageSquare className="h-3 w-3" />
            {responseCount}
          </span>
        )}
      </div>
    </button>
  );
}
