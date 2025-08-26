class PixabayApiService {
  constructor() {
    // Free Pixabay API - requires key but has generous free tier
    this.apiKey = process.env.REACT_APP_PIXABAY_API_KEY || 'YOUR_PIXABAY_API_KEY';
    this.baseUrl = 'https://pixabay.com/api/videos/';
    this.cache = new Map();
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes
  }

  // Main method to search for videos by query
  async searchVideos(query, count = 20, orientation = 'vertical') {
    const cacheKey = `${query}_${count}_${orientation}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        q: query,
        video_type: 'all',
        orientation: orientation,
        category: 'all',
        min_duration: 20,
        max_duration: 300,
        per_page: Math.min(count, 200), // Pixabay max is 200
        safesearch: 'true',
        order: 'popular'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();
      const processedVideos = this.processVideos(data.hits, query);

      // Cache the results
      this.cache.set(cacheKey, {
        data: processedVideos,
        timestamp: Date.now()
      });

      return processedVideos;
    } catch (error) {
      console.error('Pixabay API error:', error);
      return this.getFallbackVideos(query, count);
    }
  }

  // Search for trending/popular videos
  async getTrendingVideos(count = 20) {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        video_type: 'all',
        orientation: 'vertical',
        category: 'all',
        min_duration: 20,
        max_duration: 300,
        per_page: Math.min(count, 200),
        safesearch: 'true',
        order: 'popular'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processVideos(data.hits, 'trending');
    } catch (error) {
      console.error('Pixabay trending videos error:', error);
      return this.getFallbackVideos('trending', count);
    }
  }

  // Process Pixabay video data into our app format
  processVideos(videos, category) {
    return videos.map(video => {
      const duration = this.calculateDuration(video.duration);
      const views = this.generateViews();
      const engagement = this.generateEngagement(views);

      return {
        id: `pixabay_${video.id}`,
        title: this.generateTitle(video, category),
        creator: video.user || 'Pixabay Creator',
        views: this.formatCount(views),
        likes: this.formatCount(engagement.likes),
        comments: this.formatCount(engagement.comments),
        shares: this.formatCount(engagement.shares),
        duration: duration,
        category: this.getCategoryName(category),
        source: 'Pixabay',
        trending: Math.random() > 0.7, // 30% chance of being marked trending
        thumbnail: video.picture_id ? `https://i.vimeocdn.com/video/${video.picture_id}_640x360.jpg` : null,
        videoUrl: this.getBestVideoQuality(video.videos),
        embedUrl: null, // Pixabay doesn't provide embed URLs, we'll use direct video
        watchUrl: video.pageURL,
        width: video.videos?.medium?.width || 640,
        height: video.videos?.medium?.height || 360,
        tags: video.tags ? video.tags.split(',').map(tag => tag.trim()) : [],
        downloads: video.downloads,
        originalData: video // Keep original for debugging
      };
    });
  }

  // Get the best quality video file for mobile shorts
  getBestVideoQuality(videos) {
    if (!videos) return null;

    // Pixabay video quality priority: large > medium > small > tiny
    const qualities = ['large', 'medium', 'small', 'tiny'];
    
    for (const quality of qualities) {
      if (videos[quality] && videos[quality].url) {
        return videos[quality].url;
      }
    }
    
    return null;
  }

  // Generate realistic view counts
  generateViews() {
    const ranges = [
      { min: 1000, max: 10000, weight: 0.4 },      // 1K-10K (40%)
      { min: 10000, max: 100000, weight: 0.3 },    // 10K-100K (30%)
      { min: 100000, max: 1000000, weight: 0.2 },  // 100K-1M (20%)
      { min: 1000000, max: 10000000, weight: 0.1 } // 1M-10M (10%)
    ];

    const random = Math.random();
    let cumulativeWeight = 0;

    for (const range of ranges) {
      cumulativeWeight += range.weight;
      if (random <= cumulativeWeight) {
        return Math.floor(Math.random() * (range.max - range.min) + range.min);
      }
    }

    return Math.floor(Math.random() * 10000) + 1000; // fallback
  }

  // Generate realistic engagement metrics
  generateEngagement(views) {
    const likeRate = 0.02 + Math.random() * 0.08; // 2-10% like rate
    const commentRate = 0.001 + Math.random() * 0.004; // 0.1-0.5% comment rate
    const shareRate = 0.005 + Math.random() * 0.015; // 0.5-2% share rate

    return {
      likes: Math.floor(views * likeRate),
      comments: Math.floor(views * commentRate),
      shares: Math.floor(views * shareRate)
    };
  }

  // Generate compelling titles based on video content and category
  generateTitle(video, category) {
    const baseTitles = {
      trending: [
        '🔥 Viral Content Alert!',
        '✨ Trending Right Now!',
        '🚀 Popular Video Moment',
        '💫 Everyone\'s Watching This!',
        '🎬 Amazing Visual Content'
      ],
      gaming: [
        '🎮 Epic Gaming Action',
        '🕹️ Pro Gaming Moments',
        '🎯 Gaming Highlights',
        '🔥 Gaming Skills Showcase',
        '⚡ Action-Packed Gaming'
      ],
      comedy: [
        '😂 Hilarious Content!',
        '🤣 Comedy Gold',
        '😄 Funny Moments',
        '🎭 Entertainment Value',
        '😂 Laugh Out Loud'
      ],
      tech: [
        '💻 Tech Innovation',
        '🔧 Technology Showcase',
        '📱 Cool Tech Content',
        '⚡ Future Technology',
        '🚀 Tech Advancement'
      ],
      education: [
        '📚 Educational Value',
        '🧠 Learning Content',
        '💡 Knowledge Share',
        '📖 Educational Video',
        '🎓 Learn Something New'
      ],
      nature: [
        '🌿 Nature\'s Beauty',
        '🌅 Natural Wonders',
        '🦋 Wildlife Moments',
        '🌊 Scenic Beauty',
        '🌺 Natural Masterpiece'
      ],
      lifestyle: [
        '✨ Lifestyle Content',
        '💫 Life Inspiration',
        '🌈 Positive Vibes',
        '🌟 Lifestyle Goals',
        '💖 Good Vibes Only'
      ]
    };

    const categoryTitles = baseTitles[category] || baseTitles.trending;
    const randomTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    
    // Sometimes use original tags to create more specific titles
    if (video.tags && Math.random() > 0.5) {
      const tags = video.tags.split(',').map(tag => tag.trim());
      if (tags.length > 0) {
        const tag = tags[0];
        return `${randomTitle.split(' ')[0]} ${tag.charAt(0).toUpperCase() + tag.slice(1)} Video`;
      }
    }

    return randomTitle;
  }

  // Calculate video duration
  calculateDuration(seconds) {
    if (seconds < 60) {
      return `0:${seconds.toString().padStart(2, '0')}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  // Get category display name
  getCategoryName(category) {
    const categoryMap = {
      trending: 'Trending',
      gaming: 'Gaming',
      comedy: 'Comedy',
      tech: 'Tech',
      education: 'Education',
      nature: 'Nature',
      lifestyle: 'Lifestyle'
    };
    
    return categoryMap[category] || 'Video';
  }

  // Format numbers with K/M suffixes
  formatCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
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

  // Get fallback videos when API fails
  getFallbackVideos(category, count) {
    const fallbackVideos = [
      {
        id: 'pixabay_fallback_1',
        title: '🎬 High-Quality Video Content',
        creator: 'Pixabay Community',
        views: '1.5M',
        likes: '120K',
        comments: '3.2K',
        shares: '25K',
        duration: '0:42',
        category: 'Video',
        source: 'Pixabay',
        trending: true,
        thumbnail: 'https://cdn.pixabay.com/photo/2016/02/01/00/56/news-1174463_960_720.jpg',
        videoUrl: 'https://cdn.pixabay.com/vimeo/389261989/sky-39925.mp4?width=960&hash=f8c6de44e0c8c8f63fb0a6cbda2a3bc0f4c2c1bc',
        embedUrl: null,
        watchUrl: 'https://pixabay.com/videos/sky-stars-night-moon-clouds-39925/',
        width: 960,
        height: 540,
        tags: ['high-quality', 'video', 'content']
      }
    ];

    return Array(count).fill(null).map((_, index) => ({
      ...fallbackVideos[0],
      id: `pixabay_fallback_${index + 1}`,
      title: `${fallbackVideos[0].title} #${index + 1}`
    }));
  }

  // Get category-specific search queries
  getCategoryQueries(category) {
    const queryMap = {
      trending: ['popular', 'viral', 'trending', 'amazing', 'stunning'],
      gaming: ['gaming', 'esports', 'game', 'player', 'competition'],
      comedy: ['funny', 'humor', 'comedy', 'entertaining', 'laughing'],
      tech: ['technology', 'innovation', 'digital', 'computer', 'modern'],
      education: ['education', 'learning', 'tutorial', 'knowledge', 'study'],
      nature: ['nature', 'landscape', 'wildlife', 'outdoor', 'scenic', 'forest', 'ocean'],
      lifestyle: ['lifestyle', 'daily', 'people', 'activity', 'wellness', 'inspiration']
    };

    return queryMap[category] || queryMap.trending;
  }

  // Search videos by category with multiple queries for variety
  async searchVideosByCategory(category, count = 20) {
    const queries = this.getCategoryQueries(category);
    let allVideos = [];

    for (const query of queries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
      try {
        const videos = await this.searchVideos(query, Math.ceil(count / 3), 'vertical');
        allVideos = [...allVideos, ...videos];
      } catch (error) {
        console.error(`Pixabay search error for query "${query}":`, error);
      }
    }

    // Remove duplicates and shuffle
    const uniqueVideos = allVideos.filter((video, index, self) => 
      index === self.findIndex(v => v.id === video.id)
    );

    return this.shuffleArray(uniqueVideos).slice(0, count);
  }

  // Search by specific Pixabay categories
  async searchByPixabayCategory(pixabayCategory, count = 20) {
    const validCategories = [
      'backgrounds', 'fashion', 'nature', 'science', 'education', 
      'feelings', 'health', 'people', 'religion', 'places', 
      'animals', 'industry', 'computer', 'food', 'sports', 
      'transportation', 'travel', 'buildings', 'business', 'music'
    ];

    if (!validCategories.includes(pixabayCategory)) {
      pixabayCategory = 'all';
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        video_type: 'all',
        orientation: 'vertical',
        category: pixabayCategory,
        min_duration: 20,
        max_duration: 300,
        per_page: Math.min(count, 200),
        safesearch: 'true',
        order: 'popular'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processVideos(data.hits, pixabayCategory);
    } catch (error) {
      console.error('Pixabay category search error:', error);
      return this.getFallbackVideos(pixabayCategory, count);
    }
  }

  // Utility: Shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Get API usage info
  async getApiInfo() {
    try {
      // Pixabay doesn't have a specific endpoint for this, but we can make a small request
      const params = new URLSearchParams({
        key: this.apiKey,
        per_page: 3
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          totalHits: data.totalHits,
          remaining: response.headers.get('X-RateLimit-Remaining'),
          limit: response.headers.get('X-RateLimit-Limit')
        };
      }
    } catch (error) {
      console.error('API info error:', error);
    }
    
    return { status: 'unknown' };
  }
}

export default new PixabayApiService(); 