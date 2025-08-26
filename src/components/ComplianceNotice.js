import React from 'react';

const ComplianceNotice = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '2px solid var(--primary-gold)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'var(--accent-red)',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            zIndex: 1001
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#DC2626';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--accent-red)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingTop: '1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏛️</div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Important Notice
          </h1>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid #3B82F6',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: '#3B82F6', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
              📢 Platform Update - Legal Compliance
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', fontSize: '0.9rem' }}>
              In compliance with recent regulatory changes regarding online gaming in India, 
              our platform has been updated to use <strong>virtual currency only</strong>. 
              All games now use coins and gems instead of real money.
            </p>
          </div>

          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: 'var(--accent-green)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
              ✅ What This Means for You
            </h3>
            <ul style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.4', fontSize: '0.85rem' }}>
              <li>All games use virtual coins - no real money involved</li>
              <li>Earn coins through daily bonuses, ads, and gameplay</li>
              <li>Premium gem packs available for enhanced experience</li>
              <li>Same great games, now fully compliant and legal</li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid var(--primary-gold)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <h3 style={{ color: 'var(--primary-gold)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
              🎮 How to Get Started
            </h3>
            <ol style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.4', fontSize: '0.85rem' }}>
              <li>You start with <strong>1,000 free coins</strong></li>
              <li>Claim your daily bonus for more coins</li>
              <li>Watch ads to earn additional coins</li>
              <li>Play responsibly and have fun!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem',
          marginTop: '1rem'
        }}>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.8rem', 
            margin: '0 0 1rem 0',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            "Entertainment gaming with virtual currency - fully compliant with Indian gaming regulations"
          </p>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, var(--accent-green), #00CC70)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                flex: 1
              }}
            >
              🚀 Start Gaming
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--glass-bg)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '80px'
              }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceNotice; 