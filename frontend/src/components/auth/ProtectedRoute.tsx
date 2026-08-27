import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give the store's onRehydrateStorage time to attempt a token refresh
    // If refresh fails, forceLogout will set isAuthenticated to false
    const timer = setTimeout(() => setChecking(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while the store rehydrates and attempts refresh
  if (checking && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mb-3"></div>
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
