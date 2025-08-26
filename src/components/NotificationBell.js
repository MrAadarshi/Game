import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const {
    notifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    requestNotificationPermission,
    pushEnabled,
    notificationPermission
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const unreadCount = getUnreadCount();
  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowClearConfirm(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action?.callback) {
      notification.action.callback();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'achievement': return '🏆';
      case 'bonus': return '🎁';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '20px',
          padding: '0.5rem',
          color: 'var(--primary-gold)',
          cursor: 'pointer',
          position: 'relative',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          width: '40px',
          height: '40px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--primary-gold)';
          e.target.style.color = '#000';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))';
          e.target.style.color = 'var(--primary-gold)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'var(--accent-red)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '700',
            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '0.5rem',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            minWidth: '350px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            zIndex: 1001
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              color: 'var(--primary-gold)',
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '700'
            }}>
              Notifications
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!pushEnabled && notificationPermission !== 'denied' && (
                <button
                  onClick={requestNotificationPermission}
                  style={{
                    background: 'var(--accent-green)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.3rem 0.6rem',
                    color: '#000',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Enable Push
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.6rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  style={{
                    background: 'var(--accent-red)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.3rem 0.6rem',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    background: notification.read ? 'transparent' : 'rgba(255, 215, 0, 0.05)',
                    transition: 'background 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 215, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = notification.read ? 'transparent' : 'rgba(255, 215, 0, 0.05)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.8rem'
                  }}>
                    <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: notification.read ? '400' : '600',
                        marginBottom: '0.3rem',
                        fontSize: '0.9rem'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        lineHeight: '1.4',
                        marginBottom: '0.5rem'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.7rem'
                      }}>
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-green)',
                        flexShrink: 0,
                        marginTop: '0.5rem'
                      }} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔔</div>
                <div style={{ fontSize: '0.9rem' }}>No notifications yet</div>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div style={{
              padding: '0.8rem 1rem',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page if implemented
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-gold)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                View All Notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
              <h3 style={{
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0',
                fontSize: '1.3rem'
              }}>
                Clear All Notifications?
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                margin: 0,
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                This will permanently delete all {notifications.length} notifications. This action cannot be undone.
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllNotifications();
                  setShowClearConfirm(false);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.8rem 1.5rem',
                  background: 'var(--accent-red)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 