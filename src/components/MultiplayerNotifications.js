import React, { useState, useEffect } from 'react';

const MultiplayerNotifications = ({ notifications, onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss(id);
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      left: '20px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxWidth: '300px'
    }}>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            background: 'linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.95))',
            border: `2px solid ${
              notification.type === 'success' ? 'var(--accent-green)' : 
              notification.type === 'warning' ? 'var(--primary-gold)' : 
              notification.type === 'error' ? 'var(--accent-red)' : 
              'var(--accent-color)'
            }`,
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            animation: 'slideInLeft 0.3s ease-out'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              color: notification.type === 'success' ? 'var(--accent-green)' : 
                     notification.type === 'warning' ? 'var(--primary-gold)' : 
                     notification.type === 'error' ? 'var(--accent-red)' : 
                     'var(--accent-color)',
              fontWeight: '700',
              fontSize: '0.9rem'
            }}>
              {notification.type === 'success' && '✅ '}
              {notification.type === 'warning' && '⚠️ '}
              {notification.type === 'error' && '❌ '}
              {notification.type === 'info' && 'ℹ️ '}
              {notification.title}
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0',
                marginLeft: '1rem'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            lineHeight: '1.4'
          }}>
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultiplayerNotifications; 