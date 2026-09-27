// useCustomerSession.ts — React hook for auth session state
// Subscribes to authStore changes so any component using this hook
// re-renders automatically when the session changes.

import { useState, useEffect } from 'react';
import { authStore } from '../services/authStore';
import type { CustomerSession } from '../services/authStore';

export function useCustomerSession(): CustomerSession {
  const [session, setSession] = useState<CustomerSession>(() =>
    authStore.getSession()
  );

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setSession(authStore.getSession());
    });
    return unsubscribe;
  }, []);

  return session;
}
