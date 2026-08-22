import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell, type NavItem } from '@/components/DashboardShell';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { NewComplaintModal } from '@/components/NewComplaintModal';
import { StatCard } from '@/components/StatCard';
import { STATUS_LABELS } from '@/lib/constants';
import {
  Plus,
  Inbox,
  Clock,
  CheckCircle2,
  Loader2,
  Search,
  FileText,
} from 'lucide-react';


const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'complaints', label: 'My Complaints', icon: Inbox },
];

type View = 'overview' | 'complaints';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [view, setView] = useState<View>('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerComplaint, setDrawerComplaint] = useState<Complaint | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});

  const loadComplaints = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*, student:profiles!complaints_student_id_fkey(*), assignee:profiles!complaints_assigned_to_fkey(*)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setComplaints(data as unknown as Complaint[]);
      // Load response counts
      const counts: Record<string, number> = {};
      for (const c of data) {
        const { count } = await supabase
          .from('responses')
          .select('id', { count: 'exact', head: true })
          .eq('complaint_id', c.id);
        counts[c.id] = count ?? 0;
      }
      setResponseCounts(counts);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
  };

  const titles: Record<View, { title: string; subtitle: string }> = {
    overview: { title: 'Overview', subtitle: `Welcome back, ${profile?.full_name?.split(' ')[0]}` },
    complaints: { title: 'My Complaints', subtitle: 'Track and manage your submitted complaints' },
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeNav={view}
      onNavChange={(id) => setView(id as View)}
      title={titles[view].title}
      subtitle={titles[view].subtitle}
    >
      {/* New complaint CTA */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          New Complaint
        </button>
      </div>

      {view === 'overview' && (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Filed"
              value={stats.total}
              icon={<Inbox className="h-5 w-5 text-white" />}
              accent="bg-gradient-to-br from-slate-600 to-slate-500"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<Clock className="h-5 w-5 text-white" />}
              accent="bg-gradient-to-br from-amber-500 to-orange-400"
            />
            <StatCard
              label="In Progress"
              value={stats.inProgress}
              icon={<Loader2 className="h-5 w-5 text-white" />}
              accent="bg-gradient-to-br from-blue-500 to-sky-400"
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              icon={<CheckCircle2 className="h-5 w-5 text-white" />}
              accent="bg-gradient-to-br from-emerald-500 to-teal-400"
            />
          </div>

          {/* Recent complaints */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent Complaints</h2>
              <button
                onClick={() => setView('complaints')}
                className="text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                View all →
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onNew={() => setShowNew(true)} />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filtered.slice(0, 6).map((c) => (
                  <ComplaintCard
                    key={c.id}
                    complaint={c}
                    onClick={() => setDrawerComplaint(c)}
                    responseCount={responseCounts[c.id]}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'complaints' && (
        <>
          {/* Filters */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onNew={() => setShowNew(true)} />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filtered.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  onClick={() => setDrawerComplaint(c)}
                  responseCount={responseCounts[c.id]}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Drawer */}
      <ComplaintDetailDrawer
        complaint={drawerComplaint}
        onClose={() => setDrawerComplaint(null)}
        onUpdate={() => loadComplaints()}
        canManage={false}
        canRespond={true}
        role="student"
      />

      {/* New complaint modal */}
      <NewComplaintModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={() => loadComplaints()}
      />
    </DashboardShell>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Inbox className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mb-1 text-sm font-medium text-slate-600">No complaints yet</p>
      <p className="mb-4 text-xs text-slate-400">Submit a complaint to get started</p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
      >
        <Plus className="h-4 w-4" />
        New Complaint
      </button>
    </div>
  );
}
