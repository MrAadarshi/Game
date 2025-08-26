// YouTube Data API v3 Service for fetching real shorts videos

class YouTubeApiService {
  static API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
  static BASE_URL = 'https://www.googleapis.com/youtube/v3';
  static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  static cache = new Map();

  // Check if API key is available
  static isApiKeyAvailable() {
    return Boolean(this.API_KEY);
  }

  // Generic search function
  static async searchShorts(query, maxResults = 25) {
    if (!this.isApiKeyAvailable()) {
      console.warn('YouTube API key not available, using fallback data');
      return this.getFallbackShorts();
    }

    const cacheKey = `search_${query}_${maxResults}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const searchUrl = `${this.BASE_URL}/search?` +
        `key=${this.API_KEY}&` +
        `q=${encodeURIComponent(query)}&` +
        `part=snippet&` +
        `type=video&` +
        `videoDuration=short&` +
        `maxResults=${maxResults}&` +
        `order=relevance&` +
        `safeSearch=moderate`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.error) {
        console.error('YouTube API Error:', data.error);
        return this.getFallbackShorts();
      }

      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const detailsUrl = `${this.BASE_URL}/videos?` +
        `key=${this.API_KEY}&` +
        `id=${videoIds}&` +
        `part=snippet,statistics`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      const processedVideos = detailsData.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        creator: `@${video.snippet.channelTitle}`,
        views: this.formatViewCount(video.statistics.viewCount),
        likes: this.formatViewCount(video.statistics.likeCount || '0'),
        comments: this.formatViewCount(video.statistics.commentCount || '0'),
        shares: this.calculateShares(video.statistics.viewCount),
        duration: this.generateDuration(),
        category: this.categorizeVideo(video.snippet.title, video.snippet.description),
        trending: Math.random() > 0.7,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
        embedUrl: `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1`,
        watchUrl: `https://youtube.com/watch?v=${video.id}`
      }));

      this.cache.set(cacheKey, {
        data: processedVideos,
        timestamp: Date.now()
      });

      return processedVideos;
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return this.getFallbackShorts();
    }
  }

  // Get trending shorts
  static async getTrendingShorts(maxResults = 25) {
    return this.searchShorts('trending shorts viral videos', maxResults);
  }

  // Get gaming-specific shorts
  static async getGamingShorts(maxResults = 20) {
    return this.searchShorts('gaming shorts mobile PUBG FreeFire highlights', maxResults);
  }

  // Search for shorts by category with more specific queries
  static async searchShortsByCategory(category, maxResults = 15) {
    const queries = {
      gaming: 'gaming shorts mobile games PUBG FreeFire epic moments',
      comedy: 'funny shorts comedy viral hilarious memes',
      tech: 'tech shorts programming coding developer tips',
      education: 'education shorts study tips learning hacks'
    };

    const query = queries[category] || 'viral shorts trending';
    return this.searchShorts(query, maxResults);
  }

  // Search by custom query for content aggregator
  static async searchShortsByQuery(query, maxResults = 10) {
    return this.searchShorts(query, maxResults);
  }

  // Get massive content variety for a category
  static async getMassiveContent(category, maxResults = 100) {
    const queries = {
      trending: [
        'viral shorts 2024',
        'trending videos',
        'popular shorts',
        'viral moments'
      ],
      gaming: [
        'gaming shorts',
        'pubg mobile',
        'free fire',
        'gaming montage',
        'esports highlights',
        'mobile gaming'
      ],
      comedy: [
        'funny shorts',
        'comedy videos',
        'hilarious moments',
        'funny fails',
        'comedy skits'
      ],
      tech: [
        'tech shorts',
        'programming',
        'coding tips',
        'tech hacks',
        'developer'
      ],
      education: [
        'study tips',
        'educational',
        'learning hacks',
        'student tips'
      ]
    };

    const categoryQueries = queries[category] || queries.trending;
    let allVideos = [];

    // Fetch from multiple queries to get variety
    for (const query of categoryQueries) {
      try {
        const videos = await this.searchShorts(query, Math.ceil(maxResults / categoryQueries.length));
        if (videos && videos.length > 0) {
          allVideos = [...allVideos, ...videos];
        }
        
        // Add delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching videos for query "${query}":`, error);
      }
    }

    // Shuffle and limit results
    const shuffled = allVideos.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxResults);
  }

  // Utility functions
  static formatViewCount(count) {
    const num = parseInt(count) || 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  static calculateShares(viewCount) {
    const views = parseInt(viewCount) || 0;
    const shares = Math.floor(views * (0.02 + Math.random() * 0.03));
    return this.formatViewCount(shares);
  }

  static generateDuration() {
    const seconds = Math.floor(Math.random() * 50) + 15; // 15-65 seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  static categorizeVideo(title, description = '') {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('gaming') || content.includes('pubg') || content.includes('free fire')) {
      return 'Gaming';
    } else if (content.includes('funny') || content.includes('comedy') || content.includes('hilarious')) {
      return 'Comedy';
    } else if (content.includes('tech') || content.includes('programming') || content.includes('coding')) {
      return 'Tech';
    } else if (content.includes('study') || content.includes('education') || content.includes('learning')) {
      return 'Education';
    }
    
    return 'Trending';
  }

  // Fallback content when API is not available
  static getFallbackShorts() {
    return [
      {
        id: 'fallback_1',
        title: '🔥 Amazing Gaming Moments You Need to See!',
        creator: '@GamingMaster',
        views: '2.3M',
        likes: '345K',
        comments: '45K',
        shares: '123K',
        duration: '0:45',
        category: 'Gaming',
        trending: true,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
        watchUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'fallback_2',
        title: '😂 This Will Make You Laugh So Hard!',
        creator: '@ComedyKing',
        views: '1.8M',
        likes: '267K',
        comments: '32K',
        shares: '89K',
        duration: '0:38',
        category: 'Comedy',
        trending: false,
        thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1&mute=1',
        watchUrl: 'https://youtube.com/watch?v=9bZkp7q19f0'
      },
      {
        id: 'fallback_3',
        title: '💻 Code Like a Pro in 60 Seconds!',
        creator: '@TechGuru',
        views: '956K',
        likes: '145K',
        comments: '23K',
        shares: '67K',
        duration: '1:00',
        category: 'Tech',
        trending: false,
        thumbnail: 'https://img.youtube.com/vi/hFZFjoX2cGg/maxresdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/hFZFjoX2cGg?autoplay=1&mute=1',
        watchUrl: 'https://youtube.com/watch?v=hFZFjoX2cGg'
      }
    ];
  }
}

export default YouTubeApiService; 