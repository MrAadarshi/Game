import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { signup, processReferral } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for referral code in URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    return { minLength, hasNumber, hasLetter, isValid: minLength && hasNumber && hasLetter };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      setLoading(false);
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 6 characters with letters and numbers');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Extract name from email for simplicity (you could add a name field later)
      const name = email.split('@')[0];
      await signup(email, password, name);
      
      // Process referral if referral code exists
      if (referralCode) {
    try {
          await processReferral(referralCode);
        } catch (referralError) {
          console.error('Referral processing failed:', referralError);
          // Don't block registration if referral fails
        }
      }
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

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
          <h1 className="auth-title">Join Elite Gaming</h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1rem',
            marginTop: '0.5rem'
          }}>
            Create your premium gaming account
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
                placeholder="Create a strong password"
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

            {/* Password Strength Indicator */}
            {password && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.8rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--primary-gold)' }}>
                  Password Requirements:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ 
                    color: passwordValidation.minLength ? 'var(--accent-green)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {passwordValidation.minLength ? '✅' : '⭕'} At least 6 characters
                  </div>
                  <div style={{ 
                    color: passwordValidation.hasLetter ? 'var(--accent-green)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {passwordValidation.hasLetter ? '✅' : '⭕'} Contains letters
                  </div>
                  <div style={{ 
                    color: passwordValidation.hasNumber ? 'var(--accent-green)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {passwordValidation.hasNumber ? '✅' : '⭕'} Contains numbers
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div>
            <label className="form-label">
              🔐 Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
            <input
                type={showConfirmPassword ? 'text' : 'password'}
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
                style={{
                  paddingLeft: '1rem',
                  paddingRight: '3rem',
                  fontSize: '1rem',
                  borderColor: confirmPassword && password !== confirmPassword ? 'var(--accent-red)' : 'var(--border-color)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div style={{ 
                color: 'var(--accent-red)', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ❌ Passwords do not match
              </div>
            )}
            {confirmPassword && password === confirmPassword && (
              <div style={{ 
                color: 'var(--accent-green)', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ✅ Passwords match
              </div>
            )}
          </div>

          {/* Referral Code Field */}
          <div>
            <label className="form-label">
              🤝 Referral Code (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code for bonus"
              style={{
                paddingLeft: '1rem',
                fontSize: '1rem',
                borderColor: referralCode ? 'var(--primary-gold)' : 'var(--border-color)'
              }}
            />
            {referralCode && (
              <div style={{ 
                color: 'var(--primary-gold)', 
                fontSize: '0.85rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🎁 You and your friend will both get ₹100 bonus!
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.8rem',
            padding: '1rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{
                marginTop: '0.2rem',
                transform: 'scale(1.2)',
                accentColor: 'var(--primary-gold)'
              }}
            />
            <label htmlFor="acceptTerms" style={{ 
              fontSize: '0.9rem', 
              lineHeight: '1.4',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}>
              I accept the{' '}
              <span style={{ color: 'var(--primary-gold)', fontWeight: '600' }}>
                Terms & Conditions
              </span>{' '}
              and{' '}
              <span style={{ color: 'var(--primary-gold)', fontWeight: '600' }}>
                Privacy Policy
              </span>{' '}
              of Elite Gaming Casino. I confirm that I am 18+ years old.
            </label>
          </div>
          
          {/* Register Button */}
          <button 
            type="submit" 
            className="primary-btn"
            disabled={loading || !passwordValidation.isValid || password !== confirmPassword || !acceptTerms}
            style={{
              position: 'relative',
              overflow: 'hidden',
              opacity: (!passwordValidation.isValid || password !== confirmPassword || !acceptTerms) ? 0.6 : 1
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
                Creating Account...
              </div>
            ) : (
              '🚀 Create Elite Account'
            )}
          </button>
        </form>
        
        {/* Benefits */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          margin: '2rem 0',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 69, 0, 0.05))',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎁</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Welcome Bonus</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Free Credits</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎮</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>13+ Games</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Instant Access</div>
          </div>
        </div>

        {/* Login Link */}
        <div className="auth-link">
          Already have an account?{' '}
          <Link to="/login" style={{ 
            fontWeight: '700',
            textDecoration: 'none',
            borderBottom: '2px solid var(--primary-gold)',
            paddingBottom: '2px'
          }}>
            Sign In Here
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

export default Register; 