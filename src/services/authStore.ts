// authStore.ts — Simple Customer Session for The Outfit Club
// MODULE 5 / TASK 5.1 — Mock authentication foundation
//
// Architecture note:
//   This file holds ONLY authentication/session state.
//   To replace with a real backend: swap the register() and login()
//   implementations to make real API calls, then update the session
//   from the server response. All consuming components (AccountPage,
//   Header) remain unchanged.
//
// Passwords are hashed with a simple salted SHA-like stub for demo.
// NEVER store plaintext passwords in production.

const SESSION_KEY = 'the_outfit_club_session_v1';
const ACCOUNTS_KEY = 'the_outfit_club_accounts_v1';
const AUTH_CHANGE_EVENT = 'the_outfit_club_auth_changed';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface CustomerSession {
  customerId: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  // In a real app this would be a server-side hash. This is a demo stub only.
  _pwHash: string;
}

// ----------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------

/** Very lightweight demo "hash" — NOT for production use */
function _demoHash(password: string): string {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0;
  }
  return 'demo_' + Math.abs(h).toString(36);
}

function _generateId(): string {
  return `cust_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function _getAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw) as StoredAccount[];
  } catch {
    // ignore
  }
  return [];
}

function _saveAccounts(accounts: StoredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

function _dispatchChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

// ----------------------------------------------------------------
// Public store
// ----------------------------------------------------------------

export const authStore = {
  /**
   * Returns the current session from localStorage.
   * If no session exists, returns a logged-out state.
   */
  getSession(): CustomerSession {
    const empty: CustomerSession = {
      customerId: '',
      name: '',
      email: '',
      isLoggedIn: false,
    };
    if (typeof window === 'undefined') return empty;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomerSession;
        if (parsed && typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return empty;
  },

  /**
   * Attempts to log the customer in with the given credentials.
   * Returns { success: true } or { success: false, error: string }
   */
  login(
    email: string,
    password: string
  ): { success: boolean; error?: string } {
    const accounts = _getAccounts();
    const found = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!found) {
      return { success: false, error: 'No account found with that email address.' };
    }
    if (found._pwHash !== _demoHash(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const session: CustomerSession = {
      customerId: found.id,
      name: found.name,
      email: found.email,
      isLoggedIn: true,
    };
    this._persistSession(session);
    return { success: true };
  },

  /**
   * Registers a new account and immediately creates a session.
   * Returns { success: true } or { success: false, error: string }
   */
  register(
    name: string,
    email: string,
    password: string
  ): { success: boolean; error?: string } {
    const accounts = _getAccounts();
    const exists = accounts.some(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) {
      return {
        success: false,
        error: 'An account already exists with that email address.',
      };
    }

    const newAccount: StoredAccount = {
      id: _generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      _pwHash: _demoHash(password),
    };

    _saveAccounts([...accounts, newAccount]);

    const session: CustomerSession = {
      customerId: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      isLoggedIn: true,
    };
    this._persistSession(session);
    return { success: true };
  },

  /**
   * Clears the session. Cart and Wishlist are NOT touched.
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        // ignore
      }
    }
    _dispatchChange();
  },

  /**
   * Updates name and email in both the session and the stored account record.
   */
  updateProfile(
    name: string,
    email: string
  ): { success: boolean; error?: string } {
    const session = this.getSession();
    if (!session.isLoggedIn) {
      return { success: false, error: 'Not logged in.' };
    }

    // Check email uniqueness (allow same email for same user)
    const accounts = _getAccounts();
    const duplicate = accounts.find(
      (a) =>
        a.email.toLowerCase() === email.trim().toLowerCase() &&
        a.id !== session.customerId
    );
    if (duplicate) {
      return {
        success: false,
        error: 'That email address is already used by another account.',
      };
    }

    // Update stored account
    const updated = accounts.map((a) =>
      a.id === session.customerId
        ? { ...a, name: name.trim(), email: email.trim().toLowerCase() }
        : a
    );
    _saveAccounts(updated);

    // Update session
    const newSession: CustomerSession = {
      ...session,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };
    this._persistSession(newSession);
    return { success: true };
  },

  /** Internal: write session to localStorage and notify listeners */
  _persistSession(session: CustomerSession): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
    }
    _dispatchChange();
  },

  /**
   * Subscribe to session changes. Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, listener);
  },
};
