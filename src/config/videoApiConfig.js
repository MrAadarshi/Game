// Video API Configuration for Shorts Player
// Manages API keys, endpoints, and settings for all video services

class VideoApiConfig {
  constructor() {
    this.apis = {
      pexels: {
        enabled: true,
        name: 'Pexels',
        description: 'High-quality stock videos from Pexels community',
        apiKey: process.env.REACT_APP_PEXELS_API_KEY || '',
        baseUrl: 'https://api.pexels.com/videos',
        rateLimit: {
          requestsPerHour: 200, // Free tier: 200/hour
          requestsPerDay: 2000  // Free tier: 2000/day
        },
        maxResults: 80,
        cacheDuration: 30 * 60 * 1000, // 30 minutes
        priority: 2, // Higher priority for quality content
        supportsCategories: true,
        supportsSearch: true,
        supportsTrending: true,
        videoFormats: ['mp4'],
        orientations: ['portrait', 'landscape', 'square'],
        qualityLevels: ['sd', 'hd', 'fhd'],
        freeToUse: true
      },

      pixabay: {
        enabled: true,
        name: 'Pixabay',
        description: 'Free videos from Pixabay community',
        apiKey: process.env.REACT_APP_PIXABAY_API_KEY || '',
        baseUrl: 'https://pixabay.com/api/videos/',
        rateLimit: {
          requestsPerHour: 5000,  // Generous free tier
          requestsPerDay: 20000
        },
        maxResults: 200, // Pixabay allows up to 200 per request
        cacheDuration: 30 * 60 * 1000, // 30 minutes
        priority: 1, // Lower priority due to smaller video library
        supportsCategories: true,
        supportsSearch: true,
        supportsTrending: true,
        videoFormats: ['mp4', 'mov'],
        orientations: ['vertical', 'horizontal'],
        qualityLevels: ['tiny', 'small', 'medium', 'large'],
        freeToUse: true
      },

      youtube: {
        enabled: true,
        name: 'YouTube',
        description: 'YouTube Shorts via YouTube Data API',
        apiKey: process.env.REACT_APP_YOUTUBE_API_KEY || '',
        baseUrl: 'https://www.googleapis.com/youtube/v3',
        rateLimit: {
          requestsPerDay: 10000 // YouTube API quota
        },
        maxResults: 50,
        cacheDuration: 15 * 60 * 1000, // 15 minutes
        priority: 3, // Highest priority for real content
        supportsCategories: true,
        supportsSearch: true,
        supportsTrending: true,
        videoFormats: ['embed'],
        orientations: ['portrait'],
        qualityLevels: ['default', 'medium', 'high'],
        freeToUse: false
      }
    };

    this.settings = {
      // Global settings for video fetching
      defaultVideoCount: 50,
      maxConcurrentRequests: 3,
      retryAttempts: 2,
      retryDelay: 1000,
      
      // Content filtering
      safeSearch: true,
      minDuration: 10, // seconds
      maxDuration: 300, // 5 minutes
      preferredOrientation: 'portrait',
      preferredFormat: 'mp4',
      
      // Quality preferences
      preferredQuality: 'hd',
      fallbackQuality: 'sd',
      
      // Cache settings
      globalCacheDuration: 30 * 60 * 1000, // 30 minutes
      maxCacheSize: 100, // Max items per service cache
      
      // Aggregation settings
      aggregationMode: 'balanced', // 'balanced', 'quality-first', 'quantity-first'
      sourceDistribution: {
        youtube: 0.5,    // 50% YouTube if available
        pexels: 0.35,    // 35% Pexels  
        pixabay: 0.15    // 15% Pixabay
      },
      
      // Fallback behavior
      enableFallbacks: true,
      fallbackToMockData: true,
      
      // Development settings
      debugMode: process.env.NODE_ENV === 'development',
      logApiCalls: process.env.NODE_ENV === 'development',
      simulateSlowNetwork: false
    };

    this.categoryMappings = {
      // Map app categories to API-specific categories
      trending: {
        pexels: ['viral', 'popular', 'trending'],
        pixabay: ['popular', 'viral', 'trending'],
        youtube: ['trending', 'viral videos']
      },
      gaming: {
        pexels: ['gaming', 'esports', 'video game'],
        pixabay: ['gaming', 'computer', 'technology'],
        youtube: ['gaming', 'esports', 'gaming highlights']
      },
      comedy: {
        pexels: ['funny', 'entertainment', 'humor'],
        pixabay: ['funny', 'entertainment', 'people'],
        youtube: ['comedy', 'funny videos', 'entertainment']
      },
      tech: {
        pexels: ['technology', 'digital', 'innovation'],
        pixabay: ['technology', 'computer', 'science'],
        youtube: ['technology', 'tech review', 'innovation']
      },
      education: {
        pexels: ['education', 'learning', 'knowledge'],
        pixabay: ['education', 'science', 'people'],
        youtube: ['education', 'tutorial', 'learning']
      },
      nature: {
        pexels: ['nature', 'landscape', 'wildlife'],
        pixabay: ['nature', 'animals', 'places'],
        youtube: ['nature', 'wildlife', 'documentary']
      },
      lifestyle: {
        pexels: ['lifestyle', 'people', 'daily life'],
        pixabay: ['people', 'lifestyle', 'health'],
        youtube: ['lifestyle', 'vlog', 'daily life']
      }
    };
  }

  // Get configuration for a specific API
  getApiConfig(apiName) {
    return this.apis[apiName] || null;
  }

  // Get all enabled APIs
  getEnabledApis() {
    return Object.keys(this.apis).filter(apiName => this.apis[apiName].enabled);
  }

  // Get APIs sorted by priority (higher number = higher priority)
  getApisByPriority() {
    return Object.entries(this.apis)
      .filter(([_, config]) => config.enabled)
      .sort(([, a], [, b]) => b.priority - a.priority)
      .map(([name]) => name);
  }

  // Check if an API is properly configured
  isApiConfigured(apiName) {
    const config = this.apis[apiName];
    if (!config || !config.enabled) return false;
    
    // For APIs that require keys, check if key is provided
    if (apiName === 'pixabay') {
      return config.apiKey && config.apiKey !== 'YOUR_PIXABAY_API_KEY';
    }
    
    if (apiName === 'youtube') {
      return config.apiKey && config.apiKey !== '';
    }
    
    // Pexels works without key but with limitations
    return true;
  }

  // Get category queries for a specific API
  getCategoryQueries(apiName, category) {
    return this.categoryMappings[category]?.[apiName] || 
           this.categoryMappings.trending[apiName] || 
           ['popular'];
  }

  // Get optimal distribution of requests across APIs
  getRequestDistribution(totalCount) {
    const enabledApis = this.getEnabledApis().filter(api => this.isApiConfigured(api));
    const distribution = {};
    
    enabledApis.forEach(apiName => {
      const ratio = this.settings.sourceDistribution[apiName] || 0;
      distribution[apiName] = Math.ceil(totalCount * ratio);
    });

    // Ensure we don't exceed total count
    const totalRequested = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (totalRequested > totalCount) {
      // Proportionally reduce each count
      const scale = totalCount / totalRequested;
      Object.keys(distribution).forEach(apiName => {
        distribution[apiName] = Math.floor(distribution[apiName] * scale);
      });
    }

    return distribution;
  }

  // Update API configuration at runtime
  updateApiConfig(apiName, updates) {
    if (this.apis[apiName]) {
      this.apis[apiName] = { ...this.apis[apiName], ...updates };
      return true;
    }
    return false;
  }

  // Update global settings
  updateSettings(updates) {
    this.settings = { ...this.settings, ...updates };
  }

  // Enable/disable specific APIs
  setApiEnabled(apiName, enabled) {
    if (this.apis[apiName]) {
      this.apis[apiName].enabled = enabled;
      return true;
    }
    return false;
  }

  // Get API status summary
  getApiStatus() {
    const status = {};
    
    Object.keys(this.apis).forEach(apiName => {
      const config = this.apis[apiName];
      status[apiName] = {
        enabled: config.enabled,
        configured: this.isApiConfigured(apiName),
        hasApiKey: !!(config.apiKey && config.apiKey !== '' && !config.apiKey.startsWith('YOUR_')),
        priority: config.priority,
        description: config.description
      };
    });
    
    return status;
  }

  // Get performance settings based on network conditions
  getPerformanceSettings() {
    return {
      maxConcurrentRequests: this.settings.maxConcurrentRequests,
      retryAttempts: this.settings.retryAttempts,
      retryDelay: this.settings.retryDelay,
      cacheDuration: this.settings.globalCacheDuration
    };
  }

  // Log configuration (for debugging)
  logConfiguration() {
    if (!this.settings.debugMode) return;
    
    console.group('🎬 Video API Configuration');
    console.log('Enabled APIs:', this.getEnabledApis());
    console.log('API Status:', this.getApiStatus());
    console.log('Settings:', this.settings);
    console.groupEnd();
  }

  // Get recommended API keys setup instructions
  getSetupInstructions() {
    return {
      pexels: {
        required: false,
        recommended: true,
        instructions: 'Get free API key from https://www.pexels.com/api/ - Increases rate limits from 200 to 20,000 requests/hour',
        envVar: 'REACT_APP_PEXELS_API_KEY'
      },
      pixabay: {
        required: true,
        recommended: true,
        instructions: 'Get free API key from https://pixabay.com/api/docs/ - Required for access, 20,000 requests/day free',
        envVar: 'REACT_APP_PIXABAY_API_KEY'
      },
      youtube: {
        required: true,
        recommended: false,
        instructions: 'Get API key from Google Cloud Console - Costs may apply for high usage',
        envVar: 'REACT_APP_YOUTUBE_API_KEY'
      }
    };
  }
}

export default new VideoApiConfig(); 