// Lightweight auth helper for auth pages only
// Does NOT import Zustand to keep bundle size small

interface AuthData {
  token: string;
  user: {
    name: string;
    email: string;
    analysis_count: number;
    plan?: string;
  };
}

export const saveAuth = (token: string, user: AuthData['user']) => {
  if (typeof window === 'undefined') return;

  // Save in same format as Zustand persist for compatibility
  const authStorage = {
    state: {
      token,
      user,
      isLoggedIn: true
    },
    version: 0
  };

  localStorage.setItem('auth-storage', JSON.stringify(authStorage));
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth-storage');
};

export const getAuth = (): AuthData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      token: parsed.state.token,
      user: parsed.state.user
    };
  } catch {
    return null;
  }
};
