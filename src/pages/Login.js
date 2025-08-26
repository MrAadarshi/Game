import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo@elitegaming.com', 'demo123');
      navigate('/');
    } catch (error) {
      setError('Demo login failed. Please try manual login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fadeInUp">
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.5))'
          }}>
            🎰
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1rem',
            marginTop: '0.5rem'
          }}>
            Sign in to access Elite Gaming Casino
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 68, 68, 0.05))',
            border: '1px solid var(--accent-red)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--accent-red)',
            textAlign: 'center',
            fontSize: '0.95rem',
            backdropFilter: 'blur(10px)'
          }}>
            🚫 {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field */}
          <div>
            <label className="form-label">
              📧 Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                paddingLeft: '1rem',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="form-label">
              🔒 Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  paddingLeft: '1rem',
                  paddingRight: '3rem',
                  fontSize: '1rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.5rem'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
            style={{
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #000',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing In...
              </div>
            ) : (
              '🚀 Sign In to Elite Gaming'
            )}
          </button>

          {/* Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="secondary-btn"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            🎮 Try Demo Account
          </button>
        </form>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          margin: '2rem 0',
          padding: '1.5rem',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instant Payouts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>100% Secure</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fair Play</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💎</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Premium Games</div>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="auth-link">
          Don't have an account?{' '}
          <Link to="/register" style={{ 
            fontWeight: '700',
            textDecoration: 'none',
            borderBottom: '2px solid var(--primary-gold)',
            paddingBottom: '2px'
          }}>
            Join Elite Gaming
          </Link>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link 
            to="/" 
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-gold)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login; 