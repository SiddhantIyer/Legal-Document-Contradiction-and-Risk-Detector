import React, { useState } from 'react';
import { registerUser } from '../../services/api';
import '../App/AppPages.css';

export default function RegisterPage({ onRegister, onGoToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password.trim()) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
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
      const data = await registerUser(name, email, password);
      onRegister?.(data.user);
    } catch (error) {
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="label">Create Account</span>
        <h1>Register.</h1>
        <p className="auth-copy">Create your account to unlock the full dashboard experience.</p>

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
            Full Name
            <input
              value={name}
              onChange={(event) => { setName(event.target.value); setErrors(prev => ({ ...prev, name: '' })); setServerError(''); }}
              type="text"
              placeholder="Ritesh Kumar"
              disabled={loading}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
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
              placeholder="Create a password (8+ chars)"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <button className="auth-switch" type="button" onClick={onGoToLogin} disabled={loading}>
          Already have an account? Login
        </button>
      </section>
    </main>
  );
}