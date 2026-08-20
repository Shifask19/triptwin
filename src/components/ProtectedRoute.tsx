import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0A0A10' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[#E8E8F0]">Loading TripTwin</p>
            <p className="text-xs text-[#6B6B88] mt-1">Preparing your Travel Twin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
