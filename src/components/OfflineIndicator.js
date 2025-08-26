import React, { useState, useEffect } from 'react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 App is back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 App went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #ff6b6b, #ff5722)',
      color: 'white',
      padding: '0.75rem',
      textAlign: 'center',
      fontSize: '0.9rem',
      fontWeight: '600',
      zIndex: 10000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      borderBottom: '2px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#fff',
          animation: 'pulse 2s infinite'
        }}></div>
        <span>📱 You're offline - Some features may be limited</span>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#fff',
          animation: 'pulse 2s infinite'
        }}></div>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
};

export default OfflineIndicator; 