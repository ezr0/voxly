import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';

import { auth, hasFirebaseConfig } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setError('Firebase is not configured yet. Add EXPO_PUBLIC_FIREBASE_* env values.');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        setUser(nextUser);
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        await signInAnonymously(auth);
      } catch {
        setError('Could not start guest session. Check your Firebase auth settings.');
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const refreshSession = async () => {
    if (!auth) return;

    await signOut(auth);
    await signInAnonymously(auth);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      refreshSession,
    }),
    [error, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
