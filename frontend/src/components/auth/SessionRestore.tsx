import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Ensures the persisted session has fully hydrated AND the access token has
 * been restored from the refresh cookie before rendering the app routes.
 *
 * Previously the app mounted pages immediately on reload while the access
 * token was still held only in memory (it is not persisted). Requests then
 * went out without a token, the backend returned 401, and the client's
 * "other 401" branch called forceLogout() — causing spurious session logouts
 * and "could not load" errors right after a page refresh.
 */
export function SessionRestore({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Wait for zustand persist to finish rehydrating from localStorage.
      if (!useAuthStore.persist.hasHydrated()) {
        await new Promise<void>((resolve) => {
          useAuthStore.persist.onFinishHydration(() => resolve());
        });
      }
      // Restore the token (or log out if the refresh cookie is gone).
      if (!cancelled) {
        await checkSession();
        if (!cancelled) setReady(true);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [checkSession]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mb-3"></div>
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
