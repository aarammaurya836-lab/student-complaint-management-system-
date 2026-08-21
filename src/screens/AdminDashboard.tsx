import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Complaint, Profile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell, type NavItem } from '@/components/DashboardShell';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintDetailDrawer } from '@/components/ComplaintDetailDrawer';
import { StatCard } from '@/components/StatCard';
import { STATUS_LABELS, CATEGORY_LABELS, STATUS_STYLES, formatDate } from '@/lib/constants';
import {
  Inbox,
  Clock,
  CheckCircle2,
  Loader2,
  Search,
  LayoutDashboard,
  Users,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'complaints', label: 'All Complaints', icon: Inbox },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

type View = 'overview' | 'complaints' | 'users' | 'analytics';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [view, setView] = useState<View>('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerComplaint, setDrawerComplaint] = useState<Complaint | null>(null);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*, student:profiles!complaints_student_id_fkey(*), assignee:profiles!complaints_assigned_to_fkey(*)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setComplaints(data as unknown as Complaint[]);
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
  }, []);

  const loadStaff = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['staff', 'admin']);
    if (data) setStaffList(data as Profile[]);
  }, []);

  const loadProfiles = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAllProfiles(data as Profile[]);
  }, []);

  useEffect(() => {
    loadComplaints();
    loadStaff();
    loadProfiles();
  }, [loadComplaints, loadStaff, loadProfiles]);

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

  // Analytics: by category
  const categoryData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
    count: complaints.filter((c) => c.category === key).length,
  }));

  // Analytics: by status
  const statusData = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    key,
    label,
    count: complaints.filter((c) => c.status === key).length,
  }));

  const maxCategory = Math.max(...categoryData.map((d) => d.count), 1);

  const titles: Record<View, { title: string; subtitle: string }> = {
    overview: { title: 'Admin Overview', subtitle: `Welcome, ${profile?.full_name?.split(' ')[0]}` },
    complaints: { title: 'All Complaints', subtitle: 'Manage and assign all complaints across campus' },
    users: { title: 'User Management', subtitle: 'View all registered users' },
    analytics: { title: 'Analytics', subtitle: 'Insights into complaint trends and resolution' },
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeNav={view}
      onNavChange={(id) => setView(id as View)}
      title={titles[view].title}
      subtitle={titles[view].subtitle}
    >
      {/* Overview */}
      {view === 'overview' && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Complaints"
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

          {/* Quick stats row */}
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Unassigned urgent */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-900">Needs Attention</h3>
              </div>
              {complaints.filter((c) => !c.assigned_to && c.priority === 'urgent').length > 0 ? (
                <div className="space-y-2">
                  {complaints
                    .filter((c) => !c.assigned_to && c.priority === 'urgent')
                    .slice(0, 4)
                    .map((c) => (
                      <ComplaintCard
                        key={c.id}
                        complaint={c}
                        onClick={() => setDrawerComplaint(c)}
                        showStudent
                      />
                    ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">
                  No urgent unassigned complaints. All clear!
                </p>
              )}
            </div>

            {/* Status breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Status Breakdown</h3>
              <div className="space-y-3">
                {statusData.map((s) => {
                  const pct = stats.total > 0 ? (s.count / stats.total) * 100 : 0;
                  return (
                    <div key={s.key}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-slate-600">{s.label}</span>
                        <span className="text-slate-400">{s.count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            s.key === 'pending' ? 'bg-amber-400' :
                            s.key === 'in_progress' ? 'bg-blue-500' :
                            s.key === 'resolved' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent */}
          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Recent Complaints</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No complaints yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filtered.slice(0, 6).map((c) => (
                  <ComplaintCard
                    key={c.id}
                    complaint={c}
                    onClick={() => setDrawerComplaint(c)}
                    responseCount={responseCounts[c.id]}
                    showStudent
                    showAssignee
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* All complaints */}
      {view === 'complaints' && (
        <>
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

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No complaints found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filtered.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  onClick={() => setDrawerComplaint(c)}
                  responseCount={responseCounts[c.id]}
                  showStudent
                  showAssignee
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Users */}
      {view === 'users' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                <th className="px-4 py-3 font-medium text-slate-500">Role</th>
                <th className="hidden px-4 py-3 font-medium text-slate-500 sm:table-cell">Department</th>
                <th className="hidden px-4 py-3 font-medium text-slate-500 sm:table-cell">Student ID</th>
                <th className="hidden px-4 py-3 font-medium text-slate-500 sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{p.full_name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.role === 'admin' ? 'bg-violet-100 text-violet-700' :
                      p.role === 'staff' ? 'bg-sky-100 text-sky-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{p.department || '—'}</td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{p.student_id || '—'}</td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{formatDate(p.created_at)}</td>
                </tr>
              ))}
              {allProfiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Analytics */}
      {view === 'analytics' && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statusData.map((s) => (
              <StatCard
                key={s.key}
                label={s.label}
                value={s.count}
                icon={
                  s.key === 'pending' ? <Clock className="h-5 w-5 text-white" /> :
                  s.key === 'in_progress' ? <Loader2 className="h-5 w-5 text-white" /> :
                  s.key === 'resolved' ? <CheckCircle2 className="h-5 w-5 text-white" /> :
                  <Inbox className="h-5 w-5 text-white" />
                }
                accent={
                  s.key === 'pending' ? 'bg-gradient-to-br from-amber-500 to-orange-400' :
                  s.key === 'in_progress' ? 'bg-gradient-to-br from-blue-500 to-sky-400' :
                  s.key === 'resolved' ? 'bg-gradient-to-br from-emerald-500 to-teal-400' :
                  'bg-gradient-to-br from-slate-600 to-slate-500'
                }
              />
            ))}
          </div>

          {/* Category chart */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Complaints by Category</h3>
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs font-medium text-slate-600">{cat.label}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                    <div
                      className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-sky-400 to-cyan-400 px-2 transition-all"
                      style={{ width: `${(cat.count / maxCategory) * 100}%`, minWidth: cat.count > 0 ? '2rem' : '0' }}
                    >
                      {cat.count > 0 && (
                        <span className="text-xs font-semibold text-white">{cat.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status distribution table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Resolution Rate</h3>
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {statusData.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        s.key === 'pending' ? 'bg-amber-400' :
                        s.key === 'in_progress' ? 'bg-blue-500' :
                        s.key === 'resolved' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                      {s.label}
                    </span>
                    <span className="font-medium text-slate-700">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <ComplaintDetailDrawer
        complaint={drawerComplaint}
        onClose={() => setDrawerComplaint(null)}
        onUpdate={() => loadComplaints()}
        canManage={true}
        canRespond={true}
        role="admin"
        staffList={staffList}
      />
    </DashboardShell>
  );
}
