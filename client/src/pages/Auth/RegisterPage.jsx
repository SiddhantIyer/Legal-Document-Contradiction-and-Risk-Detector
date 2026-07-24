import React, { useState } from 'react';
import '../App/AppPages.css';

export default function RegisterPage({ onRegister, onGoToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password.trim()) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    return errs;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onRegister?.();
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="label">Create Account</span>
        <h1>Register.</h1>
        <p className="auth-copy">Create a mock account to unlock the dashboard flow.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              value={name}
              onChange={(event) => { setName(event.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
              type="text"
              placeholder="Ritesh Kumar"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
          <label>
            Email
            <input
              value={email}
              onChange={(event) => { setEmail(event.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
              type="email"
              placeholder="name@company.com"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => { setPassword(event.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
              type="password"
              placeholder="Create a password (8+ chars)"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <button className="btn-primary auth-submit" type="submit">Register</button>
        </form>

        <button className="auth-switch" type="button" onClick={onGoToLogin}>
          Already have an account? Login
        </button>
      </section>
    </main>
  );
}