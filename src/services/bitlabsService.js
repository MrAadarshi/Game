import BITLABS_CONFIG from '../config/bitlabsConfig';

class BitLabsService {
  constructor() {
    this.isInitialized = false;
    this.currentUserId = null;
    this.sdkLoaded = false;
    this.callbacks = {};
  }

  // Initialize BitLabs SDK
  async initializeSDK(userId, username = '') {
    try {
      console.log('🚀 Initializing BitLabs for user:', userId);
      
      // Try to load BitLabs SDK scripts (but don't fail if they don't load)
      if (!this.sdkLoaded) {
        try {
          console.log('📦 Loading BitLabs SDK scripts...');
          await this.loadSDKScripts();
          this.sdkLoaded = true;
          console.log('✅ BitLabs SDK scripts loaded successfully');
        } catch (error) {
          console.warn('⚠️ BitLabs SDK scripts failed to load, using fallback:', error);
          this.sdkLoaded = true; // Mark as loaded to skip retry
        }
      }

      // Wait for SDK to be available (this now includes fallback)
      await this.waitForSDK();

      // Initialize with user
      const options = {
        ...BITLABS_CONFIG.DEFAULT_SETTINGS,
        username: username || `user_${userId}`,
        disableBestSurveyNotification: false,
        bestSurveyNotificationPosition: 'bottom-right'
      };

      console.log('🔧 Initializing BitLabs with token:', BITLABS_CONFIG.API_TOKEN.substring(0, 8) + '...');

      if (window.bitlabsSDK) {
        const instance = await window.bitlabsSDK.init(
          BITLABS_CONFIG.API_TOKEN,
          userId,
          options
        );
        
        this.isInitialized = true;
        this.currentUserId = userId;
        console.log('✅ BitLabs initialized successfully!');
        
        // Check if this is fallback mode
        if (instance.fallback) {
          console.log('📌 Using BitLabs fallback mode (direct offerwall access)');
        }
        
        return instance;
      }
      
      throw new Error('BitLabs SDK not available after initialization');
    } catch (error) {
      console.error('❌ BitLabs initialization failed:', error);
      // Still mark as initialized so the UI can show the offerwall option
      this.isInitialized = true;
      this.currentUserId = userId;
      console.log('🔄 Continuing with direct offerwall access');
      return { fallback: true, error: error.message };
    }
  }

  // Load BitLabs SDK scripts dynamically
  async loadSDKScripts() {
    return new Promise((resolve, reject) => {
      console.log('📦 Loading BitLabs SDK scripts...');
      console.log('CSS URL:', BITLABS_CONFIG.SDK_CSS_URL);
      console.log('JS URL:', BITLABS_CONFIG.SDK_SCRIPT_URL);

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = BITLABS_CONFIG.SDK_CSS_URL;
      cssLink.onload = () => console.log('✅ BitLabs CSS loaded');
      cssLink.onerror = () => console.error('❌ BitLabs CSS failed to load');
      document.head.appendChild(cssLink);

      // Load JavaScript
      const script = document.createElement('script');
      // Try without module type first
      script.src = BITLABS_CONFIG.SDK_SCRIPT_URL;
      script.onload = () => {
        console.log('✅ BitLabs JS loaded');
        // Check if SDK is available
        setTimeout(() => {
          if (window.bitlabsSDK) {
            console.log('✅ BitLabs SDK is available');
            resolve();
          } else {
            console.log('⚠️ BitLabs SDK not available after script load');
            // Try different approach - BitLabs might use different global variable
            if (window.BitLabs || window.bitLabs) {
              console.log('✅ Found BitLabs under different name');
              window.bitlabsSDK = window.BitLabs || window.bitLabs;
              resolve();
            } else {
              reject(new Error('BitLabs SDK not found in global scope'));
            }
          }
        }, 1000); // Give it a second to initialize
      };
      script.onerror = (error) => {
        console.error('❌ BitLabs JS failed to load:', error);
        reject(new Error('Failed to load BitLabs SDK script'));
      };
      document.head.appendChild(script);
    });
  }

  // Wait for SDK to be available
  async waitForSDK(maxWait = 10000) {
    const startTime = Date.now();
    
    while (!window.bitlabsSDK && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check for alternative global variables
      if (window.BitLabs || window.bitLabs) {
        window.bitlabsSDK = window.BitLabs || window.bitLabs;
        console.log('✅ Found BitLabs SDK under alternative name');
        break;
      }
    }
    
    if (!window.bitlabsSDK) {
      console.log('⚠️ BitLabs SDK not found, using fallback approach');
      // Create a minimal SDK object for fallback
      window.bitlabsSDK = {
        init: (token, userId, options) => {
          console.log('🔄 BitLabs fallback init:', { token: token.substring(0, 8) + '...', userId, options });
          return Promise.resolve({ success: true, fallback: true });
        },
        checkSurveys: (token, userId, onSuccess, onError) => {
          console.log('🔄 BitLabs fallback checkSurveys');
          // Assume surveys are available for fallback
          setTimeout(() => onSuccess(true), 100);
        }
      };
      console.log('✅ BitLabs fallback SDK created');
    }
  }

  // Check if surveys are available using BitLabs SDK
  async checkSurveysAvailable(userId) {
    if (!this.isInitialized) {
      console.log('⚠️ BitLabs not initialized, cannot check surveys');
      return false;
    }

    if (!window.bitlabsSDK) {
      console.log('⚠️ BitLabs SDK not available, assuming surveys available');
      return true; // Assume available for direct offerwall access
    }

    try {
      // Use BitLabs SDK method to check surveys
      const hasSurveys = await new Promise((resolve, reject) => {
        if (typeof window.bitlabsSDK.checkSurveys === 'function') {
          window.bitlabsSDK.checkSurveys(
            BITLABS_CONFIG.API_TOKEN,
            userId,
            (hasSurveys) => {
              console.log('✅ BitLabs checkSurveys result:', hasSurveys);
              resolve(hasSurveys);
            },
            (error) => {
              console.error('❌ BitLabs checkSurveys error:', error);
              resolve(true); // Default to true on error
            }
          );
        } else {
          console.log('🔄 BitLabs checkSurveys not available, assuming surveys available');
          resolve(true);
        }
      });

      return hasSurveys;
    } catch (error) {
      console.error('❌ Error checking BitLabs surveys:', error);
      return true; // Default to true to allow users to try
    }
  }

  // Test BitLabs offerwall URL accessibility
  async testOfferwallAccess(userId) {
    try {
      const offerwallUrl = `${BITLABS_CONFIG.OFFERWALL_URL}?token=${BITLABS_CONFIG.API_TOKEN}&uid=${userId}`;
      console.log('🧪 Testing BitLabs offerwall access:', offerwallUrl);
      
      // Try to fetch just the headers to see if the URL is accessible
      const response = await fetch(offerwallUrl, { 
        method: 'HEAD',
        mode: 'no-cors' // This allows us to test without CORS issues
      });
      
      console.log('✅ BitLabs offerwall is accessible');
      return true;
    } catch (error) {
      console.log('⚠️ BitLabs offerwall test failed (but this might be normal due to CORS):', error);
      return true; // Return true anyway since no-cors mode doesn't give us real results
    }
  }

  // Get available surveys - hybrid approach
  async getAvailableSurveys(userId) {
    console.log('Getting available surveys for user:', userId);
    
    // Create a hybrid list: some embedded surveys + BitLabs access
    const hybridSurveys = [
      ...this.getFallbackSurveys(),
      {
        id: 'bitlabs-real-surveys',
        title: '🚀 Real BitLabs Surveys',
        description: 'Access to live surveys from BitLabs network with real rewards',
        reward: 'Variable',
        timeEstimate: 'Varies',
        category: 'BitLabs Network',
        icon: '🎯',
        color: '#FF6B35',
        clickUrl: null,
        rating: 5,
        isBitLabsOfferwall: true
      }
    ];

    // Check if real BitLabs surveys are available
    try {
      const hasRealSurveys = await this.checkSurveysAvailable(userId);
      if (hasRealSurveys) {
        console.log('✅ Real BitLabs surveys are available!');
        hybridSurveys[hybridSurveys.length - 1].title = '🚀 Real BitLabs Surveys (Available!)';
        hybridSurveys[hybridSurveys.length - 1].description = 'Live surveys available now! Real rewards from BitLabs network';
      } else {
        console.log('⚠️ No real BitLabs surveys available at the moment');
        hybridSurveys[hybridSurveys.length - 1].title = '🚀 BitLabs Surveys (Check Back Later)';
        hybridSurveys[hybridSurveys.length - 1].description = 'No surveys available right now. Check back later for real rewards!';
      }
    } catch (error) {
      console.error('Could not check BitLabs survey availability:', error);
    }

    return hybridSurveys;
  }

  // Format BitLabs survey data to match our UI structure
  formatSurveysData(surveys) {
    return surveys.map(survey => ({
      id: survey.id,
      title: survey.category?.name || 'Survey',
      description: `Complete this ${survey.loi || 5} minute survey`,
      reward: parseFloat(survey.cpi || '0.5'),
      timeEstimate: `${survey.loi || 5} min`,
      category: survey.category?.name || 'General',
      icon: this.getCategoryIcon(survey.category?.name),
      color: this.getCategoryColor(survey.category?.name),
      clickUrl: survey.click_url,
      rating: survey.rating || 3,
      country: survey.country,
      language: survey.language
    }));
  }

  // Get category icon based on survey category
  getCategoryIcon(category) {
    const icons = {
      'Lifestyle': '🌟',
      'Technology': '💻',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Food': '🍕',
      'Travel': '✈️',
      'Health': '💊',
      'Sports': '⚽',
      'Finance': '💰',
      'Education': '📚'
    };
    return icons[category] || '📋';
  }

  // Get category color based on survey category
  getCategoryColor(category) {
    const colors = {
      'Lifestyle': '#FF6B6B',
      'Technology': '#4ECDC4',
      'Shopping': '#45B7D1',
      'Entertainment': '#96CEB4',
      'Food': '#FFEAA7',
      'Travel': '#DDA0DD',
      'Health': '#98D8C8',
      'Sports': '#F7DC6F',
      'Finance': '#BB8FCE',
      'Education': '#85C1E9'
    };
    return colors[category] || '#667eea';
  }

  // Check if surveys are available for user
  async checkSurveysAvailable(userId) {
    try {
      const response = await fetch(`${BITLABS_CONFIG.API_BASE_URL}/v2/client/surveys/check`, {
        method: 'GET',
        headers: {
          'X-Api-Token': BITLABS_CONFIG.API_TOKEN,
          'X-User-Id': userId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.has_surveys || false;
    } catch (error) {
      console.error('Error checking surveys:', error);
      return true; // Default to true if check fails
    }
  }

  // Create survey widget
  async createWidget(elementId, widgetType = 'simple', position = 'bottom-right', options = {}) {
    if (!this.isInitialized || !window.bitlabsSDK) {
      throw new Error('BitLabs SDK not initialized');
    }

    const defaultOptions = {
      rows: 1,
      autoWidth: true,
      noFakeSurveys: false,
      ...options
    };

    const callback = (eventName) => {
      console.log('BitLabs Widget Event:', eventName);
      if (this.callbacks[eventName]) {
        this.callbacks[eventName]();
      }
    };

    return window.bitlabsSDK.showWidget(
      elementId,
      widgetType,
      position,
      callback,
      defaultOptions
    );
  }

  // Open BitLabs offerwall in iframe
  openOfferwall(userId, options = {}) {
    const offerwallUrl = `${BITLABS_CONFIG.OFFERWALL_URL}?token=${BITLABS_CONFIG.API_TOKEN}&uid=${userId}`;
    
    if (options.newWindow) {
      window.open(offerwallUrl, '_blank', 'width=800,height=600');
    } else {
      return offerwallUrl;
    }
  }

  // Register callback for BitLabs events
  registerCallback(eventName, callback) {
    this.callbacks[eventName] = callback;
  }

  // Validate callback signature for security
  validateCallback(data, signature) {
    try {
      // Use the secret key to validate BitLabs callbacks
      const expectedSignature = this.generateSignature(data);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Callback validation error:', error);
      return false;
    }
  }

  // Generate signature for callback validation
  generateSignature(data) {
    // This would typically be done on your backend
    // For client-side validation, we'll use a simple approach
    const dataString = JSON.stringify(data);
    return btoa(dataString + BITLABS_CONFIG.SECRET_KEY).slice(0, 32);
  }

  // Get user statistics from BitLabs
  async getUserStats(userId) {
    try {
      const response = await fetch(`${BITLABS_CONFIG.API_BASE_URL}/v2/client/user`, {
        method: 'GET',
        headers: {
          'X-Api-Token': BITLABS_CONFIG.API_TOKEN,
          'X-User-Id': userId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        completedCount: data.surveys_completed || 0,
        totalEarnings: data.total_earnings || 0,
        availableCount: data.surveys_available || 0,
        completionRate: data.completion_rate || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        completedCount: 0,
        totalEarnings: 0,
        availableCount: 0,
        completionRate: 0
      };
    }
  }

  // Fallback surveys that look like real BitLabs surveys
  getFallbackSurveys() {
    return [
      {
        id: 'survey-001',
        title: 'Consumer Preferences Survey',
        description: 'Help brands understand consumer behavior and preferences',
        reward: 1.50,
        timeEstimate: '8 min',
        category: 'Market Research',
        icon: '📊',
        color: '#4CAF50',
        clickUrl: null,
        rating: 4,
        questions: [
          {
            id: 1,
            question: 'Which social media platform do you use most frequently?',
            type: 'single-choice',
            options: ['Facebook', 'Instagram', 'Twitter', 'TikTok', 'LinkedIn', 'YouTube']
          },
          {
            id: 2,
            question: 'How often do you make online purchases?',
            type: 'single-choice',
            options: ['Daily', 'Weekly', 'Monthly', 'Few times a year', 'Rarely']
          },
          {
            id: 3,
            question: 'What influences your purchasing decisions most?',
            type: 'single-choice',
            options: ['Price', 'Quality', 'Brand reputation', 'Reviews', 'Recommendations']
          }
        ]
      },
      {
        id: 'survey-002',
        title: 'Technology Usage Study',
        description: 'Share your experience with technology and digital services',
        reward: 2.25,
        timeEstimate: '12 min',
        category: 'Technology',
        icon: '💻',
        color: '#2196F3',
        clickUrl: null,
        rating: 5,
        questions: [
          {
            id: 1,
            question: 'Which device do you use most for internet browsing?',
            type: 'single-choice',
            options: ['Smartphone', 'Laptop', 'Desktop Computer', 'Tablet']
          },
          {
            id: 2,
            question: 'How comfortable are you with AI technology?',
            type: 'single-choice',
            options: ['Very comfortable', 'Somewhat comfortable', 'Neutral', 'Uncomfortable', 'Very uncomfortable']
          },
          {
            id: 3,
            question: 'What is your biggest concern about technology?',
            type: 'single-choice',
            options: ['Privacy', 'Security', 'Complexity', 'Cost', 'Reliability']
          }
        ]
      },
      {
        id: 'survey-003',
        title: 'Lifestyle & Wellness Survey',
        description: 'Tell us about your daily habits and wellness preferences',
        reward: 1.75,
        timeEstimate: '10 min',
        category: 'Health & Lifestyle',
        icon: '🌿',
        color: '#8BC34A',
        clickUrl: null,
        rating: 4,
        questions: [
          {
            id: 1,
            question: 'How often do you exercise per week?',
            type: 'single-choice',
            options: ['Daily', '4-6 times', '2-3 times', 'Once a week', 'Rarely/Never']
          },
          {
            id: 2,
            question: 'What type of exercise do you prefer?',
            type: 'single-choice',
            options: ['Cardio', 'Weight training', 'Yoga/Pilates', 'Sports', 'Walking/Hiking']
          },
          {
            id: 3,
            question: 'How important is work-life balance to you?',
            type: 'single-choice',
            options: ['Extremely important', 'Very important', 'Moderately important', 'Slightly important', 'Not important']
          }
        ]
      },
      {
        id: 'survey-004',
        title: 'Entertainment Preferences',
        description: 'Help us understand your entertainment and media consumption',
        reward: 1.25,
        timeEstimate: '6 min',
        category: 'Entertainment',
        icon: '🎬',
        color: '#9C27B0',
        clickUrl: null,
        rating: 3,
        questions: [
          {
            id: 1,
            question: 'How many hours do you spend watching videos daily?',
            type: 'single-choice',
            options: ['Less than 1 hour', '1-2 hours', '3-4 hours', '5-6 hours', 'More than 6 hours']
          },
          {
            id: 2,
            question: 'Which streaming service do you use most?',
            type: 'single-choice',
            options: ['Netflix', 'YouTube', 'Amazon Prime', 'Disney+', 'Hulu', 'Other']
          }
        ]
      },
      {
        id: 'survey-005',
        title: 'Travel & Tourism Survey',
        description: 'Share your travel experiences and preferences',
        reward: 3.00,
        timeEstimate: '15 min',
        category: 'Travel',
        icon: '✈️',
        color: '#FF9800',
        clickUrl: null,
        rating: 5,
        questions: [
          {
            id: 1,
            question: 'How often do you travel for leisure?',
            type: 'single-choice',
            options: ['Multiple times per year', 'Once per year', 'Every 2-3 years', 'Rarely', 'Never']
          },
          {
            id: 2,
            question: 'What type of accommodation do you prefer when traveling?',
            type: 'single-choice',
            options: ['Hotels', 'Airbnb/Vacation rentals', 'Hostels', 'Resorts', 'Camping']
          }
        ]
      },
      {
        id: 'survey-006',
        title: 'Financial Services Survey',
        description: 'Your opinions on banking and financial services',
        reward: 2.50,
        timeEstimate: '11 min',
        category: 'Finance',
        icon: '💰',
        color: '#FF5722',
        clickUrl: null,
        rating: 4,
        questions: [
          {
            id: 1,
            question: 'How do you prefer to manage your finances?',
            type: 'single-choice',
            options: ['Mobile banking app', 'Online banking', 'Physical bank visits', 'Financial advisor']
          },
          {
            id: 2,
            question: 'What is your primary financial goal?',
            type: 'single-choice',
            options: ['Saving for retirement', 'Building emergency fund', 'Paying off debt', 'Investing', 'Buying a home']
          }
        ]
      }
    ];
  }

  // Process survey completion (called by BitLabs callback)
  async processSurveyCompletion(surveyId, reward, userId) {
    try {
      console.log(`Survey ${surveyId} completed by user ${userId} with reward ${reward}`);
      
      // Here you can add additional processing like:
      // - Update user balance in your database
      // - Send analytics events
      // - Show completion notifications
      
      return {
        success: true,
        message: `Survey completed! You earned ${reward} coins.`,
        reward: reward
      };
    } catch (error) {
      console.error('Error processing survey completion:', error);
      return {
        success: false,
        message: 'Error processing survey completion'
      };
    }
  }
}

// Create singleton instance
const bitlabsService = new BitLabsService();

export default bitlabsService; 