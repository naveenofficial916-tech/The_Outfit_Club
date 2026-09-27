// Customer Profile, Saved Addresses & Preferences Store for The Outfit Club

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface SavedAddress {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CustomerPreferences {
  marketingEmails: boolean;
  smsNotifications: boolean;
  currency: 'USD' | 'EUR' | 'GBP';
  fitPreference: 'Relaxed' | 'Oversized' | 'Regular';
}

const PROFILE_KEY = 'the_outfit_club_profile_v1';
const ADDRESSES_KEY = 'the_outfit_club_addresses_v1';
const PREFERENCES_KEY = 'the_outfit_club_preferences_v1';
const CUSTOMER_CHANGE_EVENT = 'the_outfit_club_customer_updated';

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Marcus',
  lastName: 'Vance',
  email: 'marcus@theoutfitclub.com',
  phone: '+1 (555) 019-2834',
};

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-default-1',
    fullName: 'Marcus Vance',
    addressLine1: '450 Mercer Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10013',
    country: 'United States',
    phone: '+1 (555) 019-2834',
    isDefault: true,
  },
];

const DEFAULT_PREFERENCES: CustomerPreferences = {
  marketingEmails: true,
  smsNotifications: true,
  currency: 'USD',
  fitPreference: 'Oversized',
};

function dispatchChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CUSTOMER_CHANGE_EVENT));
  }
}

export const customerStore = {
  getProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.firstName === 'string') {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        dispatchChange();
      } catch (e) {
        console.warn('Failed to save profile:', e);
      }
    }
  },

  getAddresses(): SavedAddress[] {
    if (typeof window === 'undefined') return DEFAULT_ADDRESSES;
    try {
      const raw = localStorage.getItem(ADDRESSES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ADDRESSES;
  },

  addAddress(addr: Omit<SavedAddress, 'id'>): SavedAddress {
    const addresses = this.getAddresses();
    const id = `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const isFirst = addresses.length === 0;

    let updated: SavedAddress[];
    const newAddress: SavedAddress = {
      ...addr,
      id,
      isDefault: isFirst || addr.isDefault,
    };

    if (newAddress.isDefault) {
      updated = [newAddress, ...addresses.map((a) => ({ ...a, isDefault: false }))];
    } else {
      updated = [newAddress, ...addresses];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));
        dispatchChange();
      } catch (e) {
        console.warn('Failed to save address:', e);
      }
    }

    return newAddress;
  },

  updateAddress(id: string, updates: Partial<SavedAddress>): SavedAddress[] {
    const addresses = this.getAddresses();
    let updated = addresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      if (updates.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));
        dispatchChange();
      } catch (e) {
        console.warn('Failed to update address:', e);
      }
    }

    return updated;
  },

  deleteAddress(id: string): SavedAddress[] {
    const addresses = this.getAddresses();
    let updated = addresses.filter((a) => a.id !== id);

    // If default address was deleted, set first remaining as default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0] = { ...updated[0], isDefault: true };
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));
        dispatchChange();
      } catch (e) {
        console.warn('Failed to delete address:', e);
      }
    }

    return updated;
  },

  setDefaultAddress(id: string): SavedAddress[] {
    return this.updateAddress(id, { isDefault: true });
  },

  getDefaultAddress(): SavedAddress | null {
    const addresses = this.getAddresses();
    return addresses.find((a) => a.isDefault) || addresses[0] || null;
  },

  getPreferences(): CustomerPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.marketingEmails === 'boolean') {
          return { ...DEFAULT_PREFERENCES, ...parsed };
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  },

  savePreferences(prefs: CustomerPreferences): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
        dispatchChange();
      } catch (e) {
        console.warn('Failed to save preferences:', e);
      }
    }
  },

  subscribe(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(CUSTOMER_CHANGE_EVENT, listener);
    return () => window.removeEventListener(CUSTOMER_CHANGE_EVENT, listener);
  },
};
