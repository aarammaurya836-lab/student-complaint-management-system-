import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthScreen from '@/screens/AuthScreen';
import StudentDashboard from '@/screens/StudentDashboard';
import StaffDashboard from '@/screens/StaffDashboard';
import AdminDashboard from '@/screens/AdminDashboard';
import { GraduationCap, Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-sky-500/30">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <p className="mt-2 text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

  switch (profile.role) {
    case 'student':
      return <StudentDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <AuthScreen />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
