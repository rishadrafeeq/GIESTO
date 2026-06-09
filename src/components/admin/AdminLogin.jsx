import { useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/siteConfig';

const AUTH_KEY = 'giesto_admin_auth';

export function isAdminAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

export function setAdminAuthed(value) {
  if (value) sessionStorage.setItem(AUTH_KEY, '1');
  else sessionStorage.removeItem(AUTH_KEY);
}

export default function AdminLogin({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (pin === siteConfig.adminPin) {
        setAdminAuthed(true);
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again or contact your developer.');
        setPin('');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-shell">
        <div className="admin-login-brand">
          <span className="admin-login-logo">{siteConfig.shopName}</span>
          <span className="admin-login-badge">Staff Portal</span>
        </div>

        <form className="admin-login-card" onSubmit={handleSubmit}>
          <div className="admin-login-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1>Sign in</h1>
          <p>Manage products, sizes, stock, and photos for your shop.</p>

          {error && (
            <div className="admin-alert admin-alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-pin">Staff PIN</label>
            <div className="admin-pin-field">
              <input
                id="login-pin"
                type={showPin ? 'text' : 'password'}
                className="form-control"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(''); }}
                placeholder="Enter your PIN"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-pin-toggle"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-dark btn-block" disabled={loading || !pin}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <Link to="/" className="admin-back">
            <span aria-hidden="true">←</span> Back to shop
          </Link>
        </form>

        <p className="admin-login-footer">
          Forgot your PIN? Ask whoever set up the website.
        </p>
      </div>
    </div>
  );
}
