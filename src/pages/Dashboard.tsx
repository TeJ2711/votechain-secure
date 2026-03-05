import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import VoterDashboard from './VoterDashboard';
import AdminDashboard from './AdminDashboard';
import AuditorDashboard from './AuditorDashboard';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'auditor': return <AuditorDashboard />;
    default: return <VoterDashboard />;
  }
}
