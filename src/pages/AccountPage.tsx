import React, { useState, useEffect } from 'react';
import { authStore } from '../services/authStore';
import { orderService } from '../services/orderService';
import { useCustomerSession } from '../hooks/useCustomerSession';
import { useWishlist } from '../services/wishlistStore';
import { useCart } from '../services/cartStore';
import { cartStore } from '../services/cartStore';
import { navigateTo } from '../utils/navigation';
import {
  UserIcon,
  BagIcon,
  HeartIcon,
  CheckIcon,
  CloseIcon,
  ArrowRightIcon,
} from '../components/common/Icons';
import './AccountPage.css';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
type AuthView = 'entry' | 'login' | 'register';

// ─────────────────────────────────────────────────────────
// Toast helper
// ─────────────────────────────────────────────────────────
function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const show = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3600);
  };

  return { message, show, clear: () => setMessage(null) };
}

// ─────────────────────────────────────────────────────────
// Email regex
// ─────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─────────────────────────────────────────────────────────
// Logged-Out: Account Entry Screen
// ─────────────────────────────────────────────────────────
function AccountEntryScreen({
  onLogin,
  onRegister,
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="auth-entry-screen">
      <div className="auth-entry-icon">
        <UserIcon size={40} />
      </div>
      <h1 className="auth-entry-title">MY ACCOUNT</h1>
      <p className="auth-entry-subtitle">
        Manage your orders, saved products and account details from one simple place.
      </p>
      <div className="auth-entry-actions">
        <button
          type="button"
          className="btn-auth-primary"
          onClick={onLogin}
          id="btn-go-to-login"
        >
          LOGIN
        </button>
        <button
          type="button"
          className="btn-auth-secondary"
          onClick={onRegister}
          id="btn-go-to-register"
        >
          CREATE ACCOUNT
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────────────────
function LoginForm({
  onBack,
  onGoRegister,
}: {
  onBack: () => void;
  onGoRegister: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_RE.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate brief async (replace with real API call later)
    setTimeout(() => {
      const result = authStore.login(email, password);
      if (!result.success) {
        setServerError(result.error || 'Login failed.');
      }
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="auth-form-screen">
      <button
        type="button"
        className="auth-back-btn"
        onClick={onBack}
        aria-label="Back to account entry"
      >
        ← Back
      </button>

      <div className="auth-form-header">
        <h1 className="auth-form-title">LOGIN</h1>
        <p className="auth-form-subtitle">Welcome back. Sign in to your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {serverError && (
          <div className="auth-server-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="login-email" className="form-label">
            EMAIL ADDRESS <span className="req">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
            }}
            placeholder="your@email.com"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label">
            PASSWORD <span className="req">*</span>
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className={`form-input ${errors.password ? 'is-invalid' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder="Enter your password"
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="auth-forgot-row">
          <button
            type="button"
            className="btn-forgot-password"
            onClick={() => alert('Password reset will be available in a future update.')}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="btn-auth-primary btn-auth-submit"
          disabled={isSubmitting}
          id="btn-login-submit"
        >
          {isSubmitting ? 'SIGNING IN...' : 'LOGIN'}
        </button>
      </form>

      <div className="auth-switch-row">
        <span className="auth-switch-text">Don't have an account?</span>
        <button
          type="button"
          className="btn-auth-switch-link"
          onClick={onGoRegister}
          id="btn-switch-to-register"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Register Form
// ─────────────────────────────────────────────────────────
function RegisterForm({
  onBack,
  onGoLogin,
}: {
  onBack: () => void;
  onGoLogin: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_RE.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const result = authStore.register(name, email, password);
      if (!result.success) {
        setServerError(result.error || 'Registration failed.');
      }
      // On success, authStore dispatches event → useCustomerSession updates → AccountPage re-renders dashboard
      setIsSubmitting(false);
    }, 300);
  };

  const clearError = (field: string) =>
    errors[field] ? setErrors((p) => ({ ...p, [field]: '' })) : undefined;

  return (
    <div className="auth-form-screen">
      <button
        type="button"
        className="auth-back-btn"
        onClick={onBack}
        aria-label="Back to account entry"
      >
        ← Back
      </button>

      <div className="auth-form-header">
        <h1 className="auth-form-title">CREATE ACCOUNT</h1>
        <p className="auth-form-subtitle">Join The Outfit Club today.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {serverError && (
          <div className="auth-server-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="reg-name" className="form-label">
            FULL NAME <span className="req">*</span>
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            className={`form-input ${errors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => { setName(e.target.value); clearError('name'); }}
            placeholder="Your full name"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">
            EMAIL ADDRESS <span className="req">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            placeholder="your@email.com"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">
            PASSWORD <span className="req">*</span>
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            className={`form-input ${errors.password ? 'is-invalid' : ''}`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            placeholder="At least 6 characters"
          />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm-password" className="form-label">
            CONFIRM PASSWORD <span className="req">*</span>
          </label>
          <input
            id="reg-confirm-password"
            type="password"
            autoComplete="new-password"
            className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
            placeholder="Repeat your password"
          />
          {errors.confirmPassword && (
            <span className="form-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn-auth-primary btn-auth-submit"
          disabled={isSubmitting}
          id="btn-register-submit"
        >
          {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <div className="auth-switch-row">
        <span className="auth-switch-text">Already have an account?</span>
        <button
          type="button"
          className="btn-auth-switch-link"
          onClick={onGoLogin}
          id="btn-switch-to-login"
        >
          Login
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Dashboard Profile Section
// ─────────────────────────────────────────────────────────
function ProfileSection({
  name,
  email,
  onUpdate,
}: {
  name: string;
  email: string;
  onUpdate: (name: string, email: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  // Sync when session changes from outside
  useEffect(() => {
    setEditName(name);
    setEditEmail(email);
  }, [name, email]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!editName.trim()) errs.name = 'Full name is required.';
    if (!editEmail.trim()) errs.email = 'Email address is required.';
    else if (!EMAIL_RE.test(editEmail)) errs.email = 'Please enter a valid email address.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    const result = authStore.updateProfile(editName, editEmail);
    if (!result.success) {
      setServerError(result.error || 'Update failed.');
      return;
    }
    onUpdate(editName.trim(), editEmail.trim().toLowerCase());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(name);
    setEditEmail(email);
    setErrors({});
    setServerError('');
    setIsEditing(false);
  };

  return (
    <div className="dashboard-card" id="profile-section">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-row">
          <UserIcon size={20} />
          <h2 className="dashboard-card-title">PROFILE</h2>
        </div>
        {!isEditing && (
          <button
            type="button"
            className="btn-card-action"
            onClick={() => setIsEditing(true)}
            id="btn-edit-profile"
          >
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="profile-display">
          <div className="profile-display-row">
            <span className="profile-display-label">NAME</span>
            <span className="profile-display-value">{name}</span>
          </div>
          <div className="profile-display-row">
            <span className="profile-display-label">EMAIL</span>
            <span className="profile-display-value">{email}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="profile-edit-form" noValidate>
          {serverError && (
            <div className="auth-server-error" role="alert">
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="edit-name" className="form-label">
              FULL NAME <span className="req">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              autoComplete="name"
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: '' }));
              }}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-email" className="form-label">
              EMAIL ADDRESS <span className="req">*</span>
            </label>
            <input
              id="edit-email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? 'is-invalid' : ''}`}
              value={editEmail}
              onChange={(e) => {
                setEditEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
              }}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-actions-bar">
            <button
              type="button"
              className="btn-form-cancel"
              onClick={handleCancel}
            >
              CANCEL
            </button>
            <button type="submit" className="btn-form-save" id="btn-save-profile">
              SAVE CHANGES
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Account Dashboard (logged in)
// ─────────────────────────────────────────────────────────
function AccountDashboard({
  name,
  email,
  onLogout,
  onProfileUpdated,
  toast,
}: {
  name: string;
  email: string;
  onLogout: () => void;
  onProfileUpdated: (name: string, email: string) => void;
  toast: { show: (msg: string) => void };
}) {
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [orderCount, setOrderCount] = useState<number>(() => {
    return orderService.getOrdersForCustomer().length;
  });

  useEffect(() => {
    const updateCount = () => {
      setOrderCount(orderService.getOrdersForCustomer().length);
    };

    updateCount();
    window.addEventListener('the_outfit_club_order_placed', updateCount);
    return () => {
      window.removeEventListener('the_outfit_club_order_placed', updateCount);
    };
  }, []);

  const handleProfileUpdate = (newName: string, newEmail: string) => {
    onProfileUpdated(newName, newEmail);
    toast.show('Profile updated successfully.');
  };

  const handleLogout = () => {
    authStore.logout();
    onLogout();
  };

  const firstName = name.split(' ')[0] || name;

  return (
    <div className="account-dashboard">
      {/* Dashboard greeting */}
      <div className="dashboard-greeting">
        <h1 className="dashboard-title">MY ACCOUNT</h1>
        <p className="dashboard-hello">Hello, {firstName}</p>
      </div>

      <div className="dashboard-grid">
        {/* 1. Profile */}
        <ProfileSection
          name={name}
          email={email}
          onUpdate={handleProfileUpdate}
        />

        {/* 2. Orders */}
        <div className="dashboard-card" id="orders-section">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-row">
              <BagIcon size={20} />
              <h2 className="dashboard-card-title">
                ORDERS
                {orderCount > 0 && (
                  <span className="dashboard-badge">{orderCount}</span>
                )}
              </h2>
            </div>
          </div>
          <p className="dashboard-card-desc">View and track your recent purchases.</p>
          <button
            type="button"
            className="btn-dashboard-nav"
            onClick={() => navigateTo('/account/orders')}
            id="btn-view-orders"
          >
            View Orders <ArrowRightIcon size={15} />
          </button>
        </div>

        {/* 3. Wishlist */}
        <div className="dashboard-card" id="wishlist-section">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-row">
              <HeartIcon size={20} />
              <h2 className="dashboard-card-title">
                WISHLIST
                {wishlistCount > 0 && (
                  <span className="dashboard-badge">{wishlistCount}</span>
                )}
              </h2>
            </div>
          </div>
          <p className="dashboard-card-desc">Your saved products and favourites.</p>
          <button
            type="button"
            className="btn-dashboard-nav"
            onClick={() => navigateTo('/wishlist')}
            id="btn-view-wishlist"
          >
            View Wishlist <ArrowRightIcon size={15} />
          </button>
        </div>

        {/* 4. Cart */}
        <div className="dashboard-card" id="cart-section">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-row">
              <BagIcon size={20} />
              <h2 className="dashboard-card-title">
                CART
                {cartCount > 0 && (
                  <span className="dashboard-badge">{cartCount}</span>
                )}
              </h2>
            </div>
          </div>
          <p className="dashboard-card-desc">Items waiting in your shopping bag.</p>
          <button
            type="button"
            className="btn-dashboard-nav"
            onClick={() => cartStore.openDrawer()}
            id="btn-view-cart"
          >
            View Cart <ArrowRightIcon size={15} />
          </button>
        </div>

        {/* 5. Account / Logout */}
        <div className="dashboard-card dashboard-card--account" id="account-section">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-row">
              <UserIcon size={20} />
              <h2 className="dashboard-card-title">ACCOUNT</h2>
            </div>
          </div>
          <p className="dashboard-card-desc">Sign out of your account on this device.</p>
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
            id="btn-logout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main AccountPage
// ─────────────────────────────────────────────────────────
export const AccountPage: React.FC = () => {
  const session = useCustomerSession();
  const [authView, setAuthView] = useState<AuthView>('entry');
  const toast = useToast();

  // When session becomes active (login/register), reset auth view to entry
  // (it will display dashboard instead via session.isLoggedIn check)
  useEffect(() => {
    if (session.isLoggedIn) {
      setAuthView('entry');
    }
  }, [session.isLoggedIn]);

  return (
    <main className="account-page-wrapper" id="account-page">
      {/* Toast */}
      {toast.message && (
        <div className="account-toast" role="status" aria-live="polite">
          <CheckIcon size={16} />
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={toast.clear}
            aria-label="Dismiss notification"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="account-container">
        {/* Breadcrumb */}
        <nav className="account-breadcrumbs" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="breadcrumb-link"
          >
            HOME
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">
            MY ACCOUNT
          </span>
        </nav>

        {/* Content */}
        {session.isLoggedIn ? (
          <AccountDashboard
            name={session.name}
            email={session.email}
            onLogout={() => setAuthView('entry')}
            onProfileUpdated={() => {/* session auto-updates via store */}}
            toast={toast}
          />
        ) : authView === 'entry' ? (
          <AccountEntryScreen
            onLogin={() => setAuthView('login')}
            onRegister={() => setAuthView('register')}
          />
        ) : authView === 'login' ? (
          <LoginForm
            onBack={() => setAuthView('entry')}
            onGoRegister={() => setAuthView('register')}
          />
        ) : (
          <RegisterForm
            onBack={() => setAuthView('entry')}
            onGoLogin={() => setAuthView('login')}
          />
        )}
      </div>
    </main>
  );
};
