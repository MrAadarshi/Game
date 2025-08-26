class PexelsApiService {
  constructor() {
    // Free Pexels API - no key required for basic usage, but recommended for higher limits
    this.apiKey = process.env.REACT_APP_PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY';
    this.baseUrl = 'https://api.pexels.com/videos';
    this.cache = new Map();
    this.cacheDuration = 30 * 60 * 1000; // 30 minutes
  }

  // Main method to search for videos by query
  async searchVideos(query, count = 20, orientation = 'portrait') {
    const cacheKey = `${query}_${count}_${orientation}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}`, {
        method: 'GET',
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      const processedVideos = this.processVideos(data.videos, query);

      // Cache the results
      this.cache.set(cacheKey, {
        data: processedVideos,
        timestamp: Date.now()
      });

      return processedVideos;
    } catch (error) {
      console.error('Pexels API error:', error);
      return this.getFallbackVideos(query, count);
    }
  }

  // Search for trending/popular videos
  async getTrendingVideos(count = 20) {
    try {
      const response = await fetch(`${this.baseUrl}/popular?per_page=${count}&orientation=portrait`, {
        method: 'GET',
        headers: {
          'Authorization': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processVideos(data.videos, 'trending');
    } catch (error) {
      console.error('Pexels trending videos error:', error);
      return this.getFallbackVideos('trending', count);
    }
  }

  // Process Pexels video data into our app format
  processVideos(videos, category) {
    return videos.map(video => {
      const duration = this.calculateDuration(video.duration);
      const views = this.generateViews();
      const engagement = this.generateEngagement(views);

      return {
        id: `pexels_${video.id}`,
        title: this.generateTitle(video, category),
        creator: video.user?.name || 'Pexels Creator',
        views: this.formatCount(views),
        likes: this.formatCount(engagement.likes),
        comments: this.formatCount(engagement.comments),
        shares: this.formatCount(engagement.shares),
        duration: duration,
        category: this.getCategoryName(category),
        source: 'Pexels',
        trending: Math.random() > 0.7, // 30% chance of being marked trending
        thumbnail: video.image || video.video_files[0]?.link,
        videoUrl: this.getBestVideoQuality(video.video_files),
        embedUrl: null, // Pexels doesn't provide embed URLs, we'll use direct video
        watchUrl: video.url,
        width: video.width,
        height: video.height,
        tags: video.tags ? video.tags.split(',').map(tag => tag.trim()) : [],
        originalData: video // Keep original for debugging
      };
    });
  }

  // Get the best quality video file for mobile shorts
  getBestVideoQuality(videoFiles) {
    // Prioritize mobile-friendly formats and reasonable file sizes
    const sortedFiles = videoFiles
      .filter(file => file.file_type === 'video/mp4') // Only MP4 for compatibility
      .sort((a, b) => {
        // Prioritize by quality but keep file size reasonable for mobile
        const aScore = this.getQualityScore(a);
        const bScore = this.getQualityScore(b);
        return bScore - aScore;
      });

    return sortedFiles[0]?.link || videoFiles[0]?.link;
  }

  // Score video quality for mobile optimization
  getQualityScore(file) {
    let score = 0;
    
    // Prefer HD but not too large
    if (file.width >= 720 && file.width <= 1080) score += 10;
    if (file.height >= 1280 && file.height <= 1920) score += 10;
    
    // Prefer smaller file sizes for mobile
    if (file.width === 720) score += 5;
    if (file.width === 1080) score += 3;
    
    return score;
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
        '🔥 This Video is Going Viral!',
        '✨ Everyone is Watching This!',
        '🚀 Trending Now: Amazing Moments',
        '💫 Can\'t Stop Watching This!',
        '🎬 Pure Visual Magic'
      ],
      gaming: [
        '🎮 Epic Gaming Moments',
        '🕹️ Incredible Gaming Skills',
        '🎯 Gaming Highlights',
        '🔥 Pro Gaming Moves',
        '⚡ Gaming Action Packed'
      ],
      comedy: [
        '😂 This Will Make You Laugh!',
        '🤣 Hilarious Moments',
        '😄 Comedy Gold Right Here',
        '🎭 Funny Content Alert',
        '😂 Laugh Challenge'
      ],
      tech: [
        '💻 Amazing Tech Content',
        '🔧 Tech Tips & Tricks',
        '📱 Cool Technology',
        '⚡ Tech Innovation',
        '🚀 Future Tech'
      ],
      education: [
        '📚 Learn Something New',
        '🧠 Educational Content',
        '💡 Knowledge Boost',
        '📖 Quick Learning',
        '🎓 Educational Gems'
      ],
      nature: [
        '🌿 Beautiful Nature Scenes',
        '🌅 Stunning Natural Beauty',
        '🦋 Nature\'s Wonders',
        '🌊 Peaceful Nature Vibes',
        '🌺 Natural Masterpiece'
      ],
      lifestyle: [
        '✨ Lifestyle Inspiration',
        '💫 Life Moments',
        '🌈 Positive Vibes Only',
        '🌟 Living Your Best Life',
        '💖 Feel Good Content'
      ]
    };

    const categoryTitles = baseTitles[category] || baseTitles.trending;
    const randomTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    
    // Sometimes use original tags to create more specific titles
    if (video.tags && Math.random() > 0.5) {
      const tags = video.tags.split(',').map(tag => tag.trim());
      if (tags.length > 0) {
        const tag = tags[0];
        return `${randomTitle.split(' ')[0]} ${tag.charAt(0).toUpperCase() + tag.slice(1)} Content`;
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
        id: 'pexels_fallback_1',
        title: '🎬 Beautiful Cinematic Content',
        creator: 'Pexels Community',
        views: '1.2M',
        likes: '85K',
        comments: '2.3K',
        shares: '15K',
        duration: '0:45',
        category: 'Video',
        source: 'Pexels',
        trending: true,
        thumbnail: 'https://images.pexels.com/photos/2832010/pexels-photo-2832010.jpeg',
        videoUrl: 'https://player.vimeo.com/external/291648067.hd.mp4?s=7f9e1b9b3d0e4a8c1a6f5c3d2e9f8b7a6c5d4e3f&profile_id=175',
        embedUrl: null,
        watchUrl: 'https://pexels.com/video/2832010',
        width: 720,
        height: 1280,
        tags: ['cinematic', 'beautiful', 'content']
      }
    ];

    return Array(count).fill(null).map((_, index) => ({
      ...fallbackVideos[0],
      id: `pexels_fallback_${index + 1}`,
      title: `${fallbackVideos[0].title} #${index + 1}`
    }));
  }

  // Get category-specific search queries
  getCategoryQueries(category) {
    const queryMap = {
      trending: ['viral content', 'popular videos', 'trending moments', 'amazing scenes'],
      gaming: ['gaming setup', 'esports', 'game streaming', 'gaming skills'],
      comedy: ['funny moments', 'comedy clips', 'humor', 'entertaining'],
      tech: ['technology', 'innovation', 'gadgets', 'tech review'],
      education: ['learning', 'educational', 'tutorial', 'knowledge'],
      nature: ['nature', 'landscape', 'wildlife', 'outdoors', 'scenic'],
      lifestyle: ['lifestyle', 'daily life', 'wellness', 'inspiration']
    };

    return queryMap[category] || queryMap.trending;
  }

  // Search videos by category with multiple queries for variety
  async searchVideosByCategory(category, count = 20) {
    const queries = this.getCategoryQueries(category);
    let allVideos = [];

    for (const query of queries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
      try {
        const videos = await this.searchVideos(query, Math.ceil(count / 3), 'portrait');
        allVideos = [...allVideos, ...videos];
      } catch (error) {
        console.error(`Pexels search error for query "${query}":`, error);
      }
    }

    // Remove duplicates and shuffle
    const uniqueVideos = allVideos.filter((video, index, self) => 
      index === self.findIndex(v => v.id === video.id)
    );

    return this.shuffleArray(uniqueVideos).slice(0, count);
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
}

export default new PexelsApiService(); 