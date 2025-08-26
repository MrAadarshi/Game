import YouTubeApiService from './youtubeApi';
import PexelsApiService from './pexelsApi';
import PixabayApiService from './pixabayApi';
import VideoApiConfig from '../config/videoApiConfig';

class ContentAggregator {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 15 * 60 * 1000; // 15 minutes
    this.platforms = {
      youtube: YouTubeApiService,
      pexels: PexelsApiService,
      pixabay: PixabayApiService
    };
    
    // Initialize configuration
    this.config = VideoApiConfig;
    this.config.logConfiguration();
    
    // Track API usage for rate limiting
    this.apiUsage = {
      youtube: { requests: 0, lastReset: Date.now() },
      pexels: { requests: 0, lastReset: Date.now() },
      pixabay: { requests: 0, lastReset: Date.now() }
    };
  }

  // Main method to get massive content variety from all sources
  async getAggregatedShorts(category = 'trending', count = 50) {
    const cacheKey = `${category}_${count}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      console.log(`📦 Using cached content for ${category}`);
      return this.cache.get(cacheKey).data;
    }

    try {
      console.log(`🔄 Aggregating ${count} videos from multiple sources for ${category}`);
      let allVideos = [];

      // Get distribution of requests across APIs
      const distribution = this.config.getRequestDistribution(count);
      console.log('📊 API Distribution:', distribution);

      // Fetch from each enabled and configured API
      const fetchPromises = [];
      
      Object.entries(distribution).forEach(([apiName, requestCount]) => {
        if (requestCount > 0 && this.config.isApiConfigured(apiName)) {
          fetchPromises.push(this.fetchFromApi(apiName, category, requestCount));
        }
      });

      // Execute all API calls in parallel
      const results = await Promise.allSettled(fetchPromises);
      
      // Process results and combine videos
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allVideos = [...allVideos, ...result.value];
        } else {
          console.warn(`❌ API fetch failed:`, result.reason);
        }
      });

      // If we don't have enough content, add mock videos
      if (allVideos.length < count * 0.3) { // Less than 30% of requested
        console.log('📝 Adding mock content for variety');
        const mockVideos = this.getMockTrendingVideos(category);
        allVideos = [...allVideos, ...mockVideos];
      }

      // Remove duplicates by ID
      const uniqueVideos = this.removeDuplicates(allVideos);
      
      // Shuffle for variety and limit to requested count
      const shuffledVideos = this.shuffleArray(uniqueVideos).slice(0, count);

      // Cache the results
      this.cache.set(cacheKey, {
        data: shuffledVideos,
        timestamp: Date.now()
      });

      console.log(`✅ Aggregated ${shuffledVideos.length} videos from ${this.getSourceCounts(shuffledVideos)} sources`);
      return shuffledVideos;

    } catch (error) {
      console.error('❌ Content aggregation error:', error);
      return this.getFallbackContent(category, count);
    }
  }

  // Fetch videos from a specific API
  async fetchFromApi(apiName, category, count) {
    try {
      const service = this.platforms[apiName];
      if (!service) {
        throw new Error(`Service ${apiName} not found`);
      }

      // Check rate limits
      if (!this.checkRateLimit(apiName)) {
        console.warn(`⚠️ Rate limit reached for ${apiName}`);
        return [];
      }

      console.log(`🔍 Fetching ${count} videos from ${apiName} for ${category}`);
      
      let videos = [];
      
      switch (apiName) {
        case 'youtube':
          videos = await this.getYouTubeVariety(category, count);
          break;
          
        case 'pexels':
          videos = await service.searchVideosByCategory(category, count);
          break;
          
        case 'pixabay':
          videos = await service.searchVideosByCategory(category, count);
          break;
          
        default:
          console.warn(`Unknown API: ${apiName}`);
          return [];
      }

      // Track API usage
      this.trackApiUsage(apiName);
      
      console.log(`✅ ${apiName}: ${videos.length} videos fetched`);
      return videos || [];

    } catch (error) {
      console.error(`❌ Error fetching from ${apiName}:`, error);
      return [];
    }
  }

  // Enhanced YouTube variety fetching (existing method)
  async getYouTubeVariety(category, count) {
    const queries = this.getCategoryQueries(category);
    let allVideos = [];

    for (const query of queries.slice(0, 3)) { // Limit queries to avoid quota issues
      try {
        const videos = await YouTubeApiService.searchShortsByQuery(query, Math.ceil(count / 3));
        if (videos && videos.length > 0) {
          allVideos = [...allVideos, ...videos];
        }
      } catch (error) {
        console.error(`Error fetching YouTube videos for query "${query}":`, error);
      }
    }

    return allVideos;
  }

  // Get category-specific search queries (enhanced)
  getCategoryQueries(category) {
    const queryMap = {
      trending: [
        'viral shorts 2024',
        'trending videos short',
        'popular shorts today',
        'viral moments compilation'
      ],
      gaming: [
        'gaming shorts mobile',
        'pubg mobile highlights',
        'free fire epic moments',
        'gaming fails funny',
        'mobile gaming tips'
      ],
      comedy: [
        'funny shorts compilation',
        'comedy videos short',
        'hilarious moments',
        'funny fails 2024',
        'comedy skits short'
      ],
      tech: [
        'tech shorts tips',
        'programming shorts',
        'coding in 60 seconds',
        'tech hacks short',
        'developer tips'
      ],
      education: [
        'study tips shorts',
        'educational videos',
        'learning hacks',
        'study motivation',
        'quick lessons'
      ],
      nature: [
        'nature shorts',
        'wildlife moments',
        'landscape videos',
        'nature documentary',
        'scenic beauty'
      ],
      lifestyle: [
        'lifestyle shorts',
        'daily routine',
        'wellness tips',
        'motivation videos',
        'lifestyle inspiration'
      ]
    };

    return queryMap[category] || queryMap.trending;
  }

  // Enhanced mock content with source attribution
  getMockTrendingVideos(category) {
    const mockContent = {
      trending: [
        {
          id: 'mock_viral_1',
          title: '🔥 This Video Broke the Internet Today!',
          creator: '@ViralKing',
          views: '15.2M',
          likes: '3.8M',
          comments: '245K',
          shares: '892K',
          duration: '0:45',
          category: 'Viral',
          source: 'Mock',
          trending: true,
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
          watchUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
          id: 'mock_pexels_1',
          title: '🎬 Stunning Visual Content',
          creator: 'Pexels Creator',
          views: '2.3M',
          likes: '456K',
          comments: '12K',
          shares: '89K',
          duration: '0:38',
          category: 'Visual',
          source: 'Pexels-Style',
          trending: false,
          thumbnail: 'https://images.pexels.com/photos/2832010/pexels-photo-2832010.jpeg',
          videoUrl: 'https://player.vimeo.com/external/291648067.hd.mp4',
          watchUrl: 'https://pexels.com/video/2832010'
        }
      ],
      gaming: [
        {
          id: 'mock_gaming_1',
          title: '🎮 INSANE Gaming Moments!',
          creator: '@ProGamer',
          views: '5.3M',
          likes: '890K',
          comments: '67K',
          shares: '234K',
          duration: '0:52',
          category: 'Gaming',
          source: 'Mock',
          thumbnail: 'https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg',
          embedUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&mute=1',
          watchUrl: 'https://youtube.com/watch?v=LXb3EKWsInQ'
        }
      ],
      // Add more categories as needed...
    };

    return mockContent[category] || mockContent.trending;
  }

  // Remove duplicate videos by ID
  removeDuplicates(videos) {
    const seen = new Set();
    return videos.filter(video => {
      const id = video.id;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }

  // Get count of videos by source for logging
  getSourceCounts(videos) {
    const counts = {};
    videos.forEach(video => {
      const source = video.source || 'Unknown';
      counts[source] = (counts[source] || 0) + 1;
    });
    return counts;
  }

  // Rate limiting check
  checkRateLimit(apiName) {
    const usage = this.apiUsage[apiName];
    const config = this.config.getApiConfig(apiName);
    
    if (!config || !usage) return true;

    const now = Date.now();
    const hoursSinceReset = (now - usage.lastReset) / (1000 * 60 * 60);

    // Reset counter if it's been more than an hour
    if (hoursSinceReset >= 1) {
      usage.requests = 0;
      usage.lastReset = now;
    }

    // Check if we're under the rate limit
    return usage.requests < (config.rateLimit.requestsPerHour || Infinity);
  }

  // Track API usage
  trackApiUsage(apiName) {
    if (this.apiUsage[apiName]) {
      this.apiUsage[apiName].requests++;
    }
  }

  // Enhanced fallback content from all sources
  getFallbackContent(category, count) {
    console.log(`🔄 Using fallback content for ${category}`);
    
    const fallbackVideos = [
      ...this.getMockTrendingVideos('trending'),
      ...this.getMockTrendingVideos('gaming'),
      ...this.getMockTrendingVideos('comedy'),
      // Add sample content from each source type
      {
        id: 'fallback_pexels_1',
        title: '🎬 Pexels Stock Video',
        creator: 'Pexels Community',
        views: '1.2M',
        likes: '85K',
        comments: '2.3K',
        shares: '15K',
        duration: '0:42',
        category: 'Stock',
        source: 'Pexels',
        thumbnail: 'https://images.pexels.com/photos/2832010/pexels-photo-2832010.jpeg'
      },
      {
        id: 'fallback_pixabay_1',
        title: '🎨 Pixabay Creative Video',
        creator: 'Pixabay Creator',
        views: '890K',
        likes: '67K',
        comments: '1.8K',
        shares: '12K',
        duration: '0:35',
        category: 'Creative',
        source: 'Pixabay',
        thumbnail: 'https://cdn.pixabay.com/photo/2016/02/01/00/56/news-1174463_960_720.jpg'
      }
    ];

    // Add calculated shares and enrich data
    const enrichedVideos = fallbackVideos.map(video => ({
      ...video,
      shares: video.shares || this.calculateShares(video.views)
    }));

    return this.shuffleArray(enrichedVideos).slice(0, count);
  }

  // Get API status for debugging
  getApiStatus() {
    return {
      config: this.config.getApiStatus(),
      usage: this.apiUsage,
      cache: this.getCacheStats()
    };
  }

  // Cache management
  isValidCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > this.cacheDuration;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Utility functions
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  calculateShares(views) {
    const viewCount = this.parseViewCount(views);
    const shareCount = Math.floor(viewCount * (0.02 + Math.random() * 0.03));
    return this.formatCount(shareCount);
  }

  parseViewCount(viewString) {
    if (typeof viewString === 'string') {
      const num = parseFloat(viewString);
      if (viewString.includes('M')) return num * 1000000;
      if (viewString.includes('K')) return num * 1000;
      return num;
    }
    return parseInt(viewString) || 0;
  }

  formatCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  // Clear cache manually if needed
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Reset API usage counters (for testing)
  resetApiUsage() {
    Object.keys(this.apiUsage).forEach(apiName => {
      this.apiUsage[apiName] = { requests: 0, lastReset: Date.now() };
    });
    console.log('🔄 API usage counters reset');
  }

  // Get comprehensive system status
  getSystemStatus() {
    return {
      apis: this.config.getApiStatus(),
      usage: this.apiUsage,
      cache: this.getCacheStats(),
      performance: this.config.getPerformanceSettings(),
      lastUpdate: new Date().toISOString()
    };
  }
}

export default new ContentAggregator(); 