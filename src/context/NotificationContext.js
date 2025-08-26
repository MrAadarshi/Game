import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationHelper } from '../utils/notificationHelper';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Load notifications from localStorage
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load push notification preference
    const pushPref = localStorage.getItem('pushNotificationsEnabled');
    setPushEnabled(pushPref === 'true');
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPushEnabled(true);
      localStorage.setItem('pushNotificationsEnabled', 'true');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setPushEnabled(true);
        localStorage.setItem('pushNotificationsEnabled', 'true');
        showInAppNotification('Notifications enabled!', 'You will now receive push notifications for wins, bonuses, and updates.', 'success');
        return true;
      }
    }
    
    return false;
  };

  const disableNotifications = () => {
    setPushEnabled(false);
    localStorage.setItem('pushNotificationsEnabled', 'false');
    showInAppNotification('Notifications disabled', 'You will no longer receive push notifications.', 'info');
  };

  const showPushNotification = (title, body, icon = '🎮', tag = 'gms-notification') => {
    if (!pushEnabled || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
        badge: '/favicon.ico',
        requireInteraction: false,
        silent: false
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing push notification:', error);
    }
  };

  const showInAppNotification = (title, message, type = 'info', duration = 5000, action = null) => {
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type, // 'success', 'error', 'warning', 'info', 'achievement', 'bonus'
      timestamp: new Date().toISOString(),
      read: false,
      action,
      duration
    };

    setNotifications(prev => {
      const updated = [notification, ...prev.slice(0, 49)]; // Keep last 50
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });

    // Show visual notification
    createVisualNotification(notification);

    return notification.id;
  };

  const createVisualNotification = (notification) => {
    const container = getOrCreateNotificationContainer();
    
    const notificationEl = document.createElement('div');
    notificationEl.className = 'in-app-notification';
    notificationEl.style.cssText = `
      background: ${getNotificationBackground(notification.type)};
      border: 1px solid ${getNotificationBorder(notification.type)};
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 0.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideInFromRight 0.5s ease-out;
      max-width: 350px;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease;
    `;

    notificationEl.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 1rem;">
        <div style="font-size: 1.5rem; flex-shrink: 0;">
          ${getNotificationIcon(notification.type)}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.3rem; font-size: 0.95rem;">
            ${notification.title}
          </div>
          <div style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4;">
            ${notification.message}
          </div>
          ${notification.action ? `
            <button onclick="window.handleNotificationAction('${notification.id}')" style="
              background: var(--accent-green);
              border: none;
              border-radius: 6px;
              padding: 0.4rem 0.8rem;
              color: #000;
              font-size: 0.8rem;
              font-weight: 600;
              margin-top: 0.5rem;
              cursor: pointer;
            ">
              ${notification.action.label}
            </button>
          ` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.2rem;
        ">×</button>
      </div>
    `;

    // Hover effects
    notificationEl.onmouseenter = () => {
      notificationEl.style.transform = 'translateX(-5px)';
    };
    notificationEl.onmouseleave = () => {
      notificationEl.style.transform = 'translateX(0)';
    };

    container.appendChild(notificationEl);

    // Auto remove after duration
    setTimeout(() => {
      if (notificationEl.parentNode) {
        notificationEl.style.animation = 'slideOutToRight 0.5s ease-out';
        setTimeout(() => {
          if (notificationEl.parentNode) {
            notificationEl.parentNode.removeChild(notificationEl);
          }
        }, 500);
      }
    }, notification.duration);
  };

  const getOrCreateNotificationContainer = () => {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 4000;
        pointer-events: none;
      `;
      container.innerHTML = '';
      
      // Make sure the container allows pointer events for its children
      container.style.pointerEvents = 'none';
      const style = document.createElement('style');
      style.textContent = `
        #notification-container > * {
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(container);
    }
    return container;
  };

  const getNotificationBackground = (type) => {
    switch (type) {
      case 'success': return 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05))';
      case 'error': return 'linear-gradient(135deg, rgba(255, 76, 76, 0.1), rgba(255, 76, 76, 0.05))';
      case 'warning': return 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))';
      case 'achievement': return 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))';
      case 'bonus': return 'linear-gradient(135deg, rgba(0, 173, 181, 0.1), rgba(0, 173, 181, 0.05))';
      default: return 'var(--glass-bg)';
    }
  };

  const getNotificationBorder = (type) => {
    switch (type) {
      case 'success': return 'rgba(0, 255, 136, 0.3)';
      case 'error': return 'rgba(255, 76, 76, 0.3)';
      case 'warning': return 'rgba(255, 193, 7, 0.3)';
      case 'achievement': return 'rgba(255, 215, 0, 0.3)';
      case 'bonus': return 'rgba(0, 173, 181, 0.3)';
      default: return 'var(--border-color)';
    }
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

  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const clearOldNotifications = (daysOld = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    setNotifications(prev => {
      const updated = prev.filter(n => new Date(n.timestamp) > cutoffDate);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  // Notification shortcuts for common scenarios
  const notifyWin = (amount, game, multiplier) => {
    // Only show win notifications for big wins (₹500+) to avoid spam
    if (amount >= 500) {
      const title = '🎉 Big Win!';
      const message = `₹${amount} from ${game} (${multiplier}x)`;
      
      showInAppNotification(title, message, 'success');
      showPushNotification(title, message, '🎉', 'big-win');
    }
    // Small wins don't trigger notifications to keep notification bar clean
  };

  const notifyBonus = (amount, type = 'bonus') => {
    const title = '💰 Bonus Received!';
    const message = `₹${amount} added to your wallet`;
    
    showInAppNotification(title, message, 'bonus');
    showPushNotification(title, message, '💰', 'bonus');
  };

  const notifyAchievement = (achievementName, reward) => {
    const title = '🏆 Achievement Unlocked!';
    const message = `"${achievementName}" - ₹${reward} reward!`;
    
    showInAppNotification(title, message, 'achievement');
    showPushNotification(title, message, '🏆', 'achievement');
  };

  const notifyPromotion = (title, message, action = null) => {
    showInAppNotification(title, message, 'bonus', 8000, action);
    showPushNotification(title, message, '🎁', 'promotion');
  };

  // Important administrative notifications
  const notifyAdminAnnouncement = (title, message, priority = 'normal') => {
    const duration = priority === 'urgent' ? 10000 : 8000;
    showInAppNotification(`📢 ${title}`, message, 'info', duration);
    showPushNotification(`Admin: ${title}`, message, '📢', 'admin');
  };

  const notifyDepositUpdate = (amount, status, txId = null) => {
    let title, message, type;
    
    switch (status) {
      case 'approved':
        title = '✅ Deposit Approved';
        message = `₹${amount} has been added to your wallet${txId ? ` (Ref: ${txId})` : ''}`;
        type = 'success';
        break;
      case 'pending':
        title = '⏳ Deposit Pending';
        message = `₹${amount} deposit is being processed${txId ? ` (Ref: ${txId})` : ''}`;
        type = 'warning';
        break;
      case 'rejected':
        title = '❌ Deposit Rejected';
        message = `₹${amount} deposit was rejected. Contact support for details.`;
        type = 'error';
        break;
      default:
        return;
    }
    
    showInAppNotification(title, message, type, 8000);
    showPushNotification(title, message, '💳', 'deposit');
  };

  const notifyWithdrawalUpdate = (amount, status, reason = null) => {
    let title, message, type;
    
    switch (status) {
      case 'approved':
        title = '✅ Withdrawal Approved';
        message = `₹${amount} has been processed and sent to your account`;
        type = 'success';
        break;
      case 'pending':
        title = '⏳ Withdrawal Pending';
        message = `₹${amount} withdrawal is being reviewed by admin`;
        type = 'warning';
        break;
      case 'rejected':
        title = '❌ Withdrawal Rejected';
        message = `₹${amount} withdrawal rejected${reason ? `: ${reason}` : '. Contact support for details.'}`;
        type = 'error';
        break;
      default:
        return;
    }
    
    showInAppNotification(title, message, type, 8000);
    showPushNotification(title, message, '💸', 'withdrawal');
  };

  const notifySystemMaintenance = (message, scheduledTime = null) => {
    const title = '🔧 System Maintenance';
    const fullMessage = scheduledTime 
      ? `${message} Scheduled for: ${scheduledTime}` 
      : message;
    
    showInAppNotification(title, fullMessage, 'warning', 10000);
    showPushNotification(title, fullMessage, '🔧', 'maintenance');
  };

  const notifySecurityAlert = (message, action = null) => {
    const title = '🔒 Security Alert';
    showInAppNotification(title, message, 'error', 10000, action);
    showPushNotification(title, message, '🔒', 'security');
  };

  // Global notification action handler
  window.handleNotificationAction = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification?.action?.callback) {
      notification.action.callback();
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    notifications,
    pushEnabled,
    notificationPermission,
    requestNotificationPermission,
    disableNotifications,
    showInAppNotification,
    showPushNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearOldNotifications,
    clearAllNotifications,
    notifyWin,
    notifyBonus,
    notifyAchievement,
    notifyPromotion,
    notifyAdminAnnouncement,
    notifyDepositUpdate,
    notifyWithdrawalUpdate,
    notifySystemMaintenance,
    notifySecurityAlert,
    getUnreadCount
  };

  // Register notification context with helper
  useEffect(() => {
    notificationHelper.setNotificationContext(value);
  }, [value]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 