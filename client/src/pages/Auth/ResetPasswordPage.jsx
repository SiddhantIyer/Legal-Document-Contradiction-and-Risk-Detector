import React, { useState } from 'react';

export default function ResetPasswordPage({ onReset, onBack }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!password.trim()) errs.password = 'New password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!confirm.trim()) errs.confirm = 'Please confirm your password.';
    else if (password !== confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSuccess(true);
    onReset?.();
  };

  if (success) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <span className="label">System Update</span>
          <h1>Password<br/>Reset.</h1>
          <p className="auth-copy">
            Your credentials have been successfully updated. You may now login with your new password.
          </p>
          <button className="btn-primary auth-submit" type="button" onClick={onBack}>
            Go to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="label">Credential Reset</span>
        <h1>New<br/>Password.</h1>
        <p className="auth-copy">
          Enter your new password below. Must be at least 8 characters.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            New Password
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
              type="password"
              placeholder="Enter new password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <label>
            Confirm Password
            <input
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors(prev => ({ ...prev, confirm: '' })); }}
              type="password"
              placeholder="Confirm new password"
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </label>
          <button className="btn-primary auth-submit" type="submit">Reset Password</button>
        </form>

        <button className="auth-switch" type="button" onClick={onBack}>
          ← Back to Login
        </button>
      </section>
    </main>
  );
}
