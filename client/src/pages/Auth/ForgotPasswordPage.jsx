import React, { useState } from 'react';

export default function ForgotPasswordPage({ onSubmit, onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitted(true);
    onSubmit?.();
  };

  if (submitted) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <span className="label">Recovery Protocol</span>
          <h1>Check<br/>Inbox.</h1>
          <p className="auth-copy">
            If an account exists for {email}, a verification code has been dispatched. Check your email and proceed to verification.
          </p>
          <button className="btn-primary auth-submit" type="button" onClick={onSubmit}>
            Enter Code
          </button>
          <button className="auth-switch" type="button" onClick={onBack}>
            ← Back to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="label">Recovery Protocol</span>
        <h1>Forgot<br/>Password.</h1>
        <p className="auth-copy">
          Enter your registered email address. We'll send a verification code to reset your credentials.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email Address
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              type="email"
              placeholder="name@company.com"
            />
            {error && <span className="field-error">{error}</span>}
          </label>
          <button className="btn-primary auth-submit" type="submit">Send Code</button>
        </form>

        <button className="auth-switch" type="button" onClick={onBack}>
          ← Back to Login
        </button>
      </section>
    </main>
  );
}
