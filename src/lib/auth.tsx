import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { resetDemo } from './repo-demo';
import { setDemoMode } from './repo-active';
import { isSupabaseConfigured, supabase } from './supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
  /** True while exploring the app with sample data instead of a real account. */
  demo: boolean;
  enterDemo: () => void;
  leaveDemo: () => void;
};

const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  demo: false,
  enterDemo: () => {},
  leaveDemo: () => {},
});

const DEMO_KEY = 'lifeboat.sample-mode';

/** Sample mode is offered while Supabase isn't set up, and in development builds. */
export const canUseDemo = !isSupabaseConfigured || __DEV__;

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setLoading] = useState(Boolean(supabase));
  const [demoChecked, setDemoChecked] = useState(false);
  const [demo, setDemo] = useState(false);
  const loading = sessionLoading || !demoChecked;

  // Stay in sample mode across reloads (the sample itself starts fresh).
  useEffect(() => {
    AsyncStorage.getItem(DEMO_KEY)
      .then((flag) => {
        if (flag === '1' && canUseDemo) {
          setDemoMode(true);
          setDemo(true);
        }
      })
      .catch(() => {})
      .finally(() => setDemoChecked(true));
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    // On native, only refresh tokens while the app is in the foreground.
    const appState =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (s) =>
            s === 'active' ? client.auth.startAutoRefresh() : client.auth.stopAutoRefresh(),
          );

    return () => {
      data.subscription.unsubscribe();
      appState?.remove();
    };
  }, []);

  const enterDemo = useCallback(() => {
    resetDemo();
    setDemoMode(true);
    AsyncStorage.setItem(DEMO_KEY, '1').catch(() => {});
    queryClient.clear();
    setDemo(true);
  }, [queryClient]);

  const leaveDemo = useCallback(() => {
    setDemoMode(false);
    AsyncStorage.removeItem(DEMO_KEY).catch(() => {});
    queryClient.clear();
    setDemo(false);
  }, [queryClient]);

  const value = useMemo(
    () => ({ session, loading, demo, enterDemo, leaveDemo }),
    [session, loading, demo, enterDemo, leaveDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
