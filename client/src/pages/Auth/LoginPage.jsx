import React, { useState } from 'react';
import '../App/AppPages.css';

export default function LoginPage({ onLogin, onGoToRegister, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password.trim()) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onLogin?.();
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="label">Secure Access</span>
        <h1>Welcome Back.</h1>
        <p className="auth-copy">Use the mock login to enter the dashboard and test the full flow.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="••••••••"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <button className="btn-primary auth-submit" type="submit">Login</button>
        </form>

        <button className="auth-switch" type="button" onClick={onForgotPassword}>
          Forgot Password?
        </button>
        <button className="auth-switch" type="button" onClick={onGoToRegister}>
          Need an account? Register
        </button>
      </section>
    </main>
  );
}