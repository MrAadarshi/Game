import BITLABS_CONFIG from '../config/bitlabsConfig';

class BitLabsCallbacks {
  constructor() {
    this.callbacks = new Map();
    this.isListening = false;
  }

  // Initialize callback system
  initialize() {
    if (this.isListening) return;
    
    // Listen for postMessage events from BitLabs iframe
    window.addEventListener('message', this.handleMessage.bind(this), false);
    this.isListening = true;
    
    console.log('BitLabs callback system initialized');
  }

  // Handle messages from BitLabs iframe
  handleMessage(event) {
    // Verify origin for security
    const allowedOrigins = [
      'https://web.bitlabs.ai',
      'https://api.bitlabs.ai',
      'https://sdk.bitlabs.ai'
    ];

    if (!allowedOrigins.includes(event.origin)) {
      return; // Ignore messages from unknown origins
    }

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      // Handle different types of BitLabs events
      switch (data.type) {
        case 'survey_complete':
          this.handleSurveyComplete(data);
          break;
        case 'survey_start':
          this.handleSurveyStart(data);
          break;
        case 'survey_screen_out':
          this.handleSurveyScreenOut(data);
          break;
        case 'offerwall_close':
          this.handleOfferwallClose(data);
          break;
        case 'reward':
          this.handleReward(data);
          break;
        default:
          console.log('Unknown BitLabs event:', data);
      }
    } catch (error) {
      console.error('Error handling BitLabs message:', error);
    }
  }

  // Handle survey completion
  handleSurveyComplete(data) {
    console.log('Survey completed:', data);
    
    const callbackData = {
      userId: data.user_id,
      surveyId: data.survey_id,
      reward: data.reward_amount,
      currency: data.currency || 'USD',
      timestamp: Date.now(),
      status: 'completed'
    };

    // Trigger registered callbacks
    this.triggerCallback('survey_complete', callbackData);
    
    // Update local storage
    this.updateLocalRewards(callbackData);
  }

  // Handle survey start
  handleSurveyStart(data) {
    console.log('Survey started:', data);
    
    const callbackData = {
      userId: data.user_id,
      surveyId: data.survey_id,
      timestamp: Date.now(),
      status: 'started'
    };

    this.triggerCallback('survey_start', callbackData);
  }

  // Handle survey screen out (partial completion)
  handleSurveyScreenOut(data) {
    console.log('Survey screen out:', data);
    
    const callbackData = {
      userId: data.user_id,
      surveyId: data.survey_id,
      reward: data.reward_amount || 0.1, // Small reward for attempt
      timestamp: Date.now(),
      status: 'screen_out'
    };

    this.triggerCallback('survey_screen_out', callbackData);
    
    // Still give small reward for attempt
    if (callbackData.reward > 0) {
      this.updateLocalRewards(callbackData);
    }
  }

  // Handle offerwall close
  handleOfferwallClose(data) {
    console.log('Offerwall closed:', data);
    
    const callbackData = {
      userId: data.user_id,
      timestamp: Date.now(),
      totalReward: data.total_reward || 0,
      surveysCompleted: data.surveys_completed || 0
    };

    this.triggerCallback('offerwall_close', callbackData);
  }

  // Handle direct reward callback
  handleReward(data) {
    console.log('Reward received:', data);
    
    const callbackData = {
      userId: data.user_id,
      reward: data.amount,
      currency: data.currency || 'USD',
      timestamp: Date.now(),
      type: data.reward_type || 'survey'
    };

    this.triggerCallback('reward', callbackData);
    this.updateLocalRewards(callbackData);
  }

  // Update local reward tracking
  updateLocalRewards(data) {
    try {
      // Get existing rewards
      const existingRewards = JSON.parse(
        localStorage.getItem(`bitlabs_rewards_${data.userId}`) || '[]'
      );

      // Add new reward
      existingRewards.push({
        ...data,
        id: `${data.surveyId || 'reward'}_${Date.now()}`,
        timestamp: Date.now()
      });

      // Save back to localStorage
      localStorage.setItem(
        `bitlabs_rewards_${data.userId}`,
        JSON.stringify(existingRewards)
      );

      // Update total earnings
      const totalEarnings = existingRewards.reduce((sum, reward) => {
        return sum + (parseFloat(reward.reward) || 0);
      }, 0);

      localStorage.setItem(
        `bitlabs_total_earnings_${data.userId}`,
        totalEarnings.toString()
      );

    } catch (error) {
      console.error('Error updating local rewards:', error);
    }
  }

  // Register a callback for specific events
  registerCallback(eventType, callback) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }
    
    this.callbacks.get(eventType).push(callback);
    console.log(`Registered callback for ${eventType}`);
  }

  // Remove a callback
  unregisterCallback(eventType, callback) {
    if (this.callbacks.has(eventType)) {
      const callbacks = this.callbacks.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Trigger callbacks for an event
  triggerCallback(eventType, data) {
    if (this.callbacks.has(eventType)) {
      const callbacks = this.callbacks.get(eventType);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} callback:`, error);
        }
      });
    }
  }

  // Get user's total earnings
  getUserTotalEarnings(userId) {
    try {
      const total = localStorage.getItem(`bitlabs_total_earnings_${userId}`);
      return parseFloat(total) || 0;
    } catch (error) {
      console.error('Error getting user earnings:', error);
      return 0;
    }
  }

  // Get user's reward history
  getUserRewardHistory(userId) {
    try {
      const rewards = localStorage.getItem(`bitlabs_rewards_${userId}`);
      return JSON.parse(rewards) || [];
    } catch (error) {
      console.error('Error getting reward history:', error);
      return [];
    }
  }

  // Clear user's reward data (for testing)
  clearUserData(userId) {
    localStorage.removeItem(`bitlabs_rewards_${userId}`);
    localStorage.removeItem(`bitlabs_total_earnings_${userId}`);
    console.log(`Cleared BitLabs data for user ${userId}`);
  }

  // Validate callback signature (for server-to-server callbacks)
  validateCallbackSignature(data, signature, secret) {
    // This would be used for server-side callback validation
    // Implementation depends on your backend setup
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(data))
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Signature validation error:', error);
      return false;
    }
  }

  // Cleanup when component unmounts
  destroy() {
    if (this.isListening) {
      window.removeEventListener('message', this.handleMessage.bind(this), false);
      this.isListening = false;
    }
    
    this.callbacks.clear();
    console.log('BitLabs callback system destroyed');
  }
}

// Create singleton instance
const bitlabsCallbacks = new BitLabsCallbacks();

export default bitlabsCallbacks; 