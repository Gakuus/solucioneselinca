import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Gates the whole app behind the session check so that, on a page reload, the
 * access token is restored from the refresh cookie BEFORE any route renders.
 *
 * The previous implementation waited on zustand's onFinishHydration promise,
 * which never resolves when rehydration already finished before the listener
 * was registered (common in dev StrictMode) — leaving the app stuck on the
 * loading screen forever.
 */
export function SessionRestore({ children }: { children: React.ReactNode }) {
  const sessionChecked = useAuthStore((s) => s.sessionChecked);

  // StrictMode double-invokes effects; make the check idempotent and safe by
  // simply relying on the store's sessionChecked flag being flipped by
  // checkSession() (invoked post-rehydration in the store itself).
  useEffect(() => {
    // Safety net: if for any reason checkSession never ran/flagged, ensure the
    // gate can still open (force logout happens when token cannot be restored).
    if (!useAuthStore.getState().sessionChecked) {
      useAuthStore.getState().checkSession();
    }
  }, []);

  if (!sessionChecked) {
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
