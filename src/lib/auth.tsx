import type { Session } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { supabase } from './supabase';

type AuthState = { session: Session | null; loading: boolean };

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ session: null, loading: Boolean(supabase) });

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    client.auth.getSession().then(({ data }) => setState({ session: data.session, loading: false }));
    const { data } = client.auth.onAuthStateChange((_event, session) =>
      setState({ session, loading: false }),
    );

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

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
