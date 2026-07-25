import React, { useState } from 'react';
import { loginUser } from '../../services/api';
import '../App/AppPages.css';

export default function LoginPage({ onLogin, onGoToRegister, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password.trim()) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email, password);
      onLogin?.(data.user);
    } catch (error) {
      setServerError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="label">Secure Access</span>
        <h1>Welcome Back.</h1>
        <p className="auth-copy">Sign in with your credentials to access the dashboard.</p>

        {serverError && (
          <div className="server-error" style={{
            background: 'rgba(235, 94, 40, 0.1)',
            border: '2px solid var(--spicy-paprika, #eb5e28)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: 'var(--spicy-paprika, #eb5e28)',
            fontWeight: 600,
          }}>
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              value={email}
              onChange={(event) => { setEmail(event.target.value); setErrors(prev => ({ ...prev, email: '' })); setServerError(''); }}
              type="email"
              placeholder="name@company.com"
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => { setPassword(event.target.value); setErrors(prev => ({ ...prev, password: '' })); setServerError(''); }}
              type="password"
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button className="auth-switch" type="button" onClick={onForgotPassword} disabled={loading}>
          Forgot Password?
        </button>
        <button className="auth-switch" type="button" onClick={onGoToRegister} disabled={loading}>
          Need an account? Register
        </button>
      </section>
    </main>
  );
}