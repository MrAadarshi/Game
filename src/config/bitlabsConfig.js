// BitLabs Configuration
// Note: Replace with your actual BitLabs credentials from the dashboard
const BITLABS_CONFIG = {
  // Your BitLabs API Token
  API_TOKEN: process.env.REACT_APP_BITLABS_TOKEN || '9de7ff6d-6992-484b-85b9-fc004ab31ebd',
  
  // BitLabs Secret Key for callback validation
  SECRET_KEY: process.env.REACT_APP_BITLABS_SECRET || 'Su3PBoOBkGY7yDvrmF3KN9vf2qNs0IMt',
  
  // BitLabs Server-to-Server Key
  SERVER_KEY: process.env.REACT_APP_BITLABS_SERVER_KEY || 'x3kelFoCBTeXFZqe3vJLzq3UlLARxGxv',
  
  // BitLabs API Base URL
  API_BASE_URL: 'https://api.bitlabs.ai',
  
  // BitLabs Web SDK URLs
  SDK_SCRIPT_URL: 'https://sdk.bitlabs.ai/bitlabs-sdk-v1.0.0.js',
  SDK_CSS_URL: 'https://sdk.bitlabs.ai/bitlabs-sdk-v1.0.0.css',
  
  // BitLabs Offerwall URL for iframe integration
  OFFERWALL_URL: 'https://web.bitlabs.ai',
  
  // Default configuration
  DEFAULT_SETTINGS: {
    disableBestSurveyNotification: false,
    bestSurveyNotificationPosition: 'bottom-right',
    showFloatingWidget: false,
    floatingWidgetPosition: 'bottom-right'
  },
  
  // Survey widget configurations
  WIDGET_TYPES: {
    SIMPLE: 'simple',
    COMPACT: 'compact',
    FULL_WIDTH: 'full-width',
    NOTIFICATION: 'notification',
    EARNINGS: 'earnings',
    OFFERS: 'offers'
  },
  
  // Callback settings
  CALLBACK_EVENTS: {
    ON_OFFERWALL_OPEN: 'onOfferwallOpen',
    ON_OFFERWALL_CLOSE: 'onOfferwallClose',
    ON_WIDGET_CLOSE: 'onWidgetClose',
    ON_SURVEY_COMPLETE: 'onSurveyComplete',
    ON_REWARD: 'onReward'
  }
};

export default BITLABS_CONFIG; 