import { type ReactNode, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/lib/supabase';
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type ShellProps = {
  children: ReactNode;
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  title: string;
  subtitle?: string;
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  staff: 'Staff Member',
  admin: 'Administrator',
};

const ROLE_STYLES: Record<UserRole, string> = {
  student: 'from-emerald-500 to-teal-400',
  staff: 'from-sky-500 to-blue-400',
  admin: 'from-violet-500 to-purple-400',
};

export function DashboardShell({
  children,
  navItems,
  activeNav,
  onNavChange,
  title,
  subtitle,
}: ShellProps) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent
          navItems={navItems}
          activeNav={activeNav}
          onNavChange={onNavChange}
          profile={profile}
          initials={initials}
          roleLabel={profile ? ROLE_LABELS[profile.role] : ''}
          roleStyle={profile ? ROLE_STYLES[profile.role] : ''}
          onSignOut={signOut}
        />
      </aside>

      {/* Sidebar — mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              navItems={navItems}
              activeNav={activeNav}
              onNavChange={(id) => {
                onNavChange(id);
                setMobileOpen(false);
              }}
              profile={profile}
              initials={initials}
              roleLabel={profile ? ROLE_LABELS[profile.role] : ''}
              roleStyle={profile ? ROLE_STYLES[profile.role] : ''}
              onSignOut={signOut}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 lg:text-xl">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 lg:text-sm">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-700">{profile?.full_name}</p>
              <p className="text-xs text-slate-400">{profile ? ROLE_LABELS[profile.role] : ''}</p>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${
                profile ? ROLE_STYLES[profile.role] : ''
              }`}
            >
              {initials || <UserIcon className="h-4 w-4" />}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems,
  activeNav,
  onNavChange,
  profile,
  initials,
  roleLabel,
  roleStyle,
  onSignOut,
}: {
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  profile: ReturnType<typeof useAuth>['profile'];
  initials?: string;
  roleLabel: string;
  roleStyle: string;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-sky-500/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Complainer</p>
          <p className="text-xs text-slate-400">Complaint System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${roleStyle}`}
          >
            {initials || <UserIcon className="h-3.5 w-3.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{profile?.full_name}</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );
}
