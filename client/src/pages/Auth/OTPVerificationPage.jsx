import React, { useState, useRef } from 'react';

export default function OTPVerificationPage({ onVerify, onResend, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    onVerify?.();
  };

  const handleResend = () => {
    setResent(true);
    onResend?.();
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <span className="label">Identity Verification</span>
        <h1>Enter<br/>Code.</h1>
        <p className="auth-copy">
          A 6-digit verification code has been sent to your registered email address.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                className="otp-digit"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {error && <p className="field-error" style={{ textAlign: 'center' }}>{error}</p>}

          <button className="btn-primary auth-submit" type="submit">Verify Code</button>
        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={handleResend}
          disabled={resent}
        >
          {resent ? 'Code Resent ✓' : 'Resend Code'}
        </button>
        <button className="auth-switch" type="button" onClick={onBack}>
          ← Back to Login
        </button>
      </section>
    </main>
  );
}
