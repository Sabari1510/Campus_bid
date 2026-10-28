import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post('/api/auth/verify-otp', { code }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMessage('✅ Email verified successfully! You can now place bids and create listings.');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/send-otp', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMessage('New verification code sent! Check your inbox or server dev logs.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 450, padding: '3rem 1.5rem' }}>
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✉️</div>
        <h1 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
          Verify Campus Email
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          We sent a 6-digit verification code to your campus email address.
        </p>

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#10b981',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder="123456"
              style={{
                width: '180px',
                textAlign: 'center',
                fontSize: '1.75rem',
                letterSpacing: '0.3em',
                fontWeight: 700,
                padding: '0.5rem'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Didn't receive the email?{' '}
          <button
            onClick={handleResend}
            style={{ background: 'transparent', color: '#38bdf8', textDecoration: 'underline' }}
          >
            Resend Code
          </button>
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          💡 <strong>Dev Tip:</strong> If email is not configured, check the backend console terminal for the generated code (`OTP_DEV_LOG=true`).
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
