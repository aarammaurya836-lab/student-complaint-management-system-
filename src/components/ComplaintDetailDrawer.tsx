import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint, Response as ComplaintResponse, Profile, ComplaintStatus, ComplaintPriority, UserRole } from '@/lib/supabase';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_STYLES, PRIORITY_LABELS, formatDate, formatDateTime } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { X, Send, Loader2, UserCircle2, Clock, CheckCircle2 } from 'lucide-react';

type Props = {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdate?: () => void;
  canManage: boolean;
  canRespond: boolean;
  staffList?: Profile[];
  role: UserRole;
};

export function ComplaintDetailDrawer({ complaint, onClose, onUpdate, canManage, canRespond, staffList, role }: Props) {
  const { user } = useAuth();
  const [responses, setResponses] = useState<ComplaintResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<ComplaintStatus | null>(null);
  const [priorityUpdate, setPriorityUpdate] = useState<ComplaintPriority | null>(null);
  const [assignTo, setAssignTo] = useState<string>('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!complaint) return;
    loadResponses(complaint.id);
    setStatusUpdate(null);
    setPriorityUpdate(null);
    setAssignTo(complaint.assigned_to ?? '');
  }, [complaint]);

  async function loadResponses(complaintId: string) {
    setLoadingResponses(true);
    const { data, error } = await supabase
      .from('responses')
      .select('*, author:profiles!responses_author_id_fkey(*)')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setResponses(data as unknown as ComplaintResponse[]);
    }
    setLoadingResponses(false);
  }

  async function handleSendResponse() {
    if (!complaint || !newMessage.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from('responses').insert({
      complaint_id: complaint.id,
      author_id: user.id,
      message: newMessage.trim(),
    });
    if (!error) {
      setNewMessage('');
      await loadResponses(complaint.id);
    }
    setSending(false);
  }

  async function handleSaveSettings() {
    if (!complaint) return;
    setSavingSettings(true);
    const updates: Record<string, unknown> = {};
    if (statusUpdate && statusUpdate !== complaint.status) updates.status = statusUpdate;
    if (priorityUpdate && priorityUpdate !== complaint.priority) updates.priority = priorityUpdate;
    if (assignTo !== (complaint.assigned_to ?? '')) updates.assigned_to = assignTo || null;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('complaints').update(updates).eq('id', complaint.id);
      if (!error && onUpdate) onUpdate();
    }
    setSavingSettings(false);
  }

  if (!complaint) return null;

  const studentName = complaint.student?.full_name ?? 'Unknown';
  const assigneeName = complaint.assignee?.full_name ?? 'Unassigned';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex-1 pr-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <span className="text-xs font-medium text-slate-400">
                {CATEGORY_LABELS[complaint.category]}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{complaint.title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Filed by {studentName} · {formatDate(complaint.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Description */}
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {complaint.description}
            </p>
          </div>

          {/* Meta info */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <MetaItem icon={<UserCircle2 className="h-4 w-4" />} label="Filed by" value={studentName} />
            <MetaItem icon={<UserCircle2 className="h-4 w-4" />} label="Assigned to" value={assigneeName} />
            <MetaItem icon={<Clock className="h-4 w-4" />} label="Created" value={formatDate(complaint.created_at)} />
            <MetaItem
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Resolved"
              value={complaint.resolved_at ? formatDate(complaint.resolved_at) : 'Not yet'}
            />
          </div>

          {/* Management controls */}
          {canManage && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Manage Complaint
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
                  <select
                    value={statusUpdate ?? complaint.status}
                    onChange={(e) => setStatusUpdate(e.target.value as ComplaintStatus)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
                  <select
                    value={priorityUpdate ?? complaint.priority}
                    onChange={(e) => setPriorityUpdate(e.target.value as ComplaintPriority)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    {(Object.keys(PRIORITY_LABELS) as ComplaintPriority[]).map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                {role === 'admin' && staffList && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Assign to</label>
                    <select
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="">Unassigned</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="mt-3 flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {savingSettings && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          )}

          {/* Responses thread */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Conversation ({responses.length})
            </h3>
            {loadingResponses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
              </div>
            ) : responses.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No responses yet.</p>
            ) : (
              <div className="space-y-3">
                {responses.map((r) => {
                  const isOwn = r.author_id === user?.id;
                  return (
                    <div key={r.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                        isOwn ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {!isOwn && (
                          <p className="mb-0.5 text-xs font-medium text-slate-500">
                            {r.author?.full_name ?? 'Unknown'}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap text-sm">{r.message}</p>
                        <p className={`mt-1 text-xs ${isOwn ? 'text-sky-100' : 'text-slate-400'}`}>
                          {formatDateTime(r.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reply bar */}
        {canRespond && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a response..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendResponse();
                }}
              />
              <button
                onClick={handleSendResponse}
                disabled={sending || !newMessage.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}
