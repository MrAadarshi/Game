// Global notification helper to avoid circular dependencies
class NotificationHelper {
  constructor() {
    this.notificationContext = null;
  }

  setNotificationContext(context) {
    this.notificationContext = context;
  }

  showWinNotification(amount, game, multiplier) {
    if (this.notificationContext) {
      this.notificationContext.notifyWin(amount, game, multiplier);
    }
  }

  showBonusNotification(amount, type = 'bonus') {
    if (this.notificationContext) {
      this.notificationContext.notifyBonus(amount, type);
    }
  }

  showAchievementNotification(achievementName, reward) {
    if (this.notificationContext) {
      this.notificationContext.notifyAchievement(achievementName, reward);
    }
  }

  showPromotionNotification(title, message, action = null) {
    if (this.notificationContext) {
      this.notificationContext.notifyPromotion(title, message, action);
    }
  }

  showInAppNotification(title, message, type = 'info', duration = 5000, action = null) {
    if (this.notificationContext) {
      this.notificationContext.showInAppNotification(title, message, type, duration, action);
    }
  }

  showErrorNotification(message) {
    if (this.notificationContext) {
      this.notificationContext.showInAppNotification('Error', message, 'error');
    }
  }

  showSuccessNotification(message) {
    if (this.notificationContext) {
      this.notificationContext.showInAppNotification('Success', message, 'success');
    }
  }

  // Important administrative notifications
  showAdminAnnouncement(title, message, priority = 'normal') {
    if (this.notificationContext) {
      this.notificationContext.notifyAdminAnnouncement(title, message, priority);
    }
  }

  showDepositUpdate(amount, status, txId = null) {
    if (this.notificationContext) {
      this.notificationContext.notifyDepositUpdate(amount, status, txId);
    }
  }

  showWithdrawalUpdate(amount, status, reason = null) {
    if (this.notificationContext) {
      this.notificationContext.notifyWithdrawalUpdate(amount, status, reason);
    }
  }

  showSystemMaintenance(message, scheduledTime = null) {
    if (this.notificationContext) {
      this.notificationContext.notifySystemMaintenance(message, scheduledTime);
    }
  }

  showSecurityAlert(message, action = null) {
    if (this.notificationContext) {
      this.notificationContext.notifySecurityAlert(message, action);
    }
  }
}

export const notificationHelper = new NotificationHelper(); 