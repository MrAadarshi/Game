import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import YouTubeApiService from '../services/youtubeApi';
import ContentAggregator from '../services/contentAggregator';

const ShortsPlayer = () => {
  const { user } = useAuth();
  const { updateVirtualBalance } = useVirtualCurrency();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [adRevenue, setAdRevenue] = useState(0);
  const [videosWatched, setVideosWatched] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [adWatchTime, setAdWatchTime] = useState(0);
  const [shortsData, setShortsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('trending');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Load real shorts data from YouTube API
  useEffect(() => {
    loadShorts();
  }, [currentCategory]);

  const loadShorts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use ContentAggregator for massive variety (50-100 videos per category)
      const shorts = await ContentAggregator.getAggregatedShorts(currentCategory, 75);
      
      if (shorts && shorts.length > 0) {
        setShortsData(shorts);
      } else {
        // Fallback to sample data if aggregator fails
        setShortsData(ContentAggregator.getFallbackContent(currentCategory, 50));
      }
    } catch (error) {
      console.error('Error loading shorts:', error);
      setError('Failed to load videos. Showing sample content.');
      setShortsData(ContentAggregator.getFallbackContent(currentCategory, 50));
    } finally {
      setLoading(false);
    }
  };

  const calculateShares = (views) => {
    // Estimate shares as 2-5% of views
    const viewCount = parseViewCount(views);
    const shareCount = Math.floor(viewCount * (0.02 + Math.random() * 0.03));
    return formatCount(shareCount);
  };

  const parseViewCount = (viewString) => {
    if (typeof viewString === 'string') {
      const num = parseFloat(viewString);
      if (viewString.includes('M')) return num * 1000000;
      if (viewString.includes('K')) return num * 1000;
      return num;
    }
    return parseInt(viewString) || 0;
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Ad content for placement between videos
  const adContent = [
    {
      id: 'ad1',
      type: 'gaming',
      title: "🎮 Download Free Gaming App!",
      description: "Play and earn rewards instantly",
      cta: "Install Now",
      revenue: 0.08,
      userReward: 15
    },
    {
      id: 'ad2',
      type: 'education',
      title: "📚 Online Courses 50% Off!",
      description: "Learn new skills this weekend",
      cta: "Start Learning",
      revenue: 0.12,
      userReward: 20
    },
    {
      id: 'ad3',
      type: 'lifestyle',
      title: "🛍️ Fashion Sale - Up to 70% Off!",
      description: "Trendy clothes for teens",
      cta: "Shop Now",
      revenue: 0.10,
      userReward: 18
    }
  ];

  const currentVideo = shortsData[currentVideoIndex];

  // Refresh shorts data
  const refreshShorts = () => {
    loadShorts();
  };

  // Change category
  const changeCategory = (category) => {
    setCurrentCategory(category);
    setCurrentVideoIndex(0);
  };

  // Check if ad should be shown (every 3 videos)
  useEffect(() => {
    if (videosWatched > 0 && videosWatched % 3 === 0) {
      setShowAd(true);
      setAdWatchTime(0);
    }
  }, [videosWatched]);

  // Ad timer
  useEffect(() => {
    let timer;
    if (showAd && adWatchTime < 15) {
      timer = setInterval(() => {
        setAdWatchTime(prev => prev + 1);
      }, 1000);
    } else if (adWatchTime >= 15) {
      // User watched full ad, give reward
      const ad = adContent[Math.floor(Math.random() * adContent.length)];
      handleAdComplete(ad);
    }
    return () => clearInterval(timer);
  }, [showAd, adWatchTime]);

  const handleAdComplete = async (ad) => {
    try {
      // Give user reward
      await updateVirtualBalance(ad.userReward, 0, 'Watched video ad');
      
      // Track revenue
      setAdRevenue(prev => prev + ad.revenue);
      
      // Hide ad and continue
      setShowAd(false);
      setAdWatchTime(0);
      
      // Show success message
      setTimeout(() => {
        alert(`🎉 You earned ${ad.userReward} coins for watching the ad!`);
      }, 500);
    } catch (error) {
      console.error('Error processing ad reward:', error);
    }
  };

  const nextVideo = () => {
    if (currentVideoIndex < shortsData.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setVideosWatched(prev => prev + 1);
      setShowComments(false);
      setIsPlaying(true);
    } else {
      // Load more videos when reaching the end
      loadMoreVideos();
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setShowComments(false);
      setIsPlaying(true);
    }
  };

  const loadMoreVideos = async () => {
    try {
      // Load more variety content
      const moreShorts = await ContentAggregator.getAggregatedShorts(currentCategory, 25);
      if (moreShorts && moreShorts.length > 0) {
        // Filter out duplicates
        const newVideos = moreShorts.filter(
          newVideo => !shortsData.some(existingVideo => existingVideo.id === newVideo.id)
        );
        
        if (newVideos.length > 0) {
          setShortsData(prev => [...prev, ...newVideos]);
        }
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
      // Add fallback content on error
      const fallbackContent = ContentAggregator.getFallbackContent(currentCategory, 10);
      setShortsData(prev => [...prev, ...fallbackContent]);
    }
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      nextVideo();
    } else if (isDownSwipe) {
      prevVideo();
    }
  };

  // Mouse wheel handler for desktop
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      nextVideo();
    } else {
      prevVideo();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        prevVideo();
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextVideo();
        break;
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'Escape':
        setShowComments(false);
        setShowCategoryMenu(false);
        break;
    }
  };

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentVideoIndex, shortsData.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    // Simulate like functionality
    alert('❤️ Liked!');
  };

  const handleShare = () => {
    // Simulate share functionality
    alert('📤 Shared to social media!');
  };

  if (showAd) {
    const ad = adContent[Math.floor(Math.random() * adContent.length)];
    
    return (
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        background: '#000',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Ad Player */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#fff',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Ad Timer */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}>
            Ad: {15 - adWatchTime}s
          </div>

          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            📺
          </div>
          
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            {ad.title}
          </h2>
          
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            {ad.description}
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
              🪙 Earn {ad.userReward} coins for watching!
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Watch the full ad to get your reward
            </div>
          </div>

          <button
            onClick={() => handleAdComplete(ad)}
            disabled={adWatchTime < 15}
            style={{
              background: adWatchTime >= 15 ? 
                'linear-gradient(135deg, #22c55e, #16a34a)' : 
                'rgba(255, 255, 255, 0.3)',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 30px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: adWatchTime >= 15 ? 'pointer' : 'not-allowed',
              opacity: adWatchTime >= 15 ? 1 : 0.6
            }}
          >
            {adWatchTime >= 15 ? ad.cta : `Wait ${15 - adWatchTime}s...`}
          </button>
        </div>
      </div>
    );
  }

      // Loading state
    if (loading) {
      return (
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: '#000',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Loading Real Shorts...
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Loading 75+ {currentCategory} videos from multiple sources
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginTop: '2rem'
          }} />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      );
    }

    // Error state
    if (error && shortsData.length === 0) {
      return (
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: '#000',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', textAlign: 'center' }}>
            Content Aggregation Active
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, textAlign: 'center', marginBottom: '2rem', lineHeight: 1.5 }}>
            Showing high-quality content from multiple sources. For real-time YouTube videos, configure the API key in environment variables.
          </div>
          <button
            onClick={refreshShorts}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Load Content
          </button>
        </div>
      );
    }

    return (
      <div 
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000',
          position: 'relative',
          overflow: 'hidden'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Minimal Header */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Category Button */}
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '25px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {currentCategory === 'trending' && '🔥'} 
            {currentCategory === 'gaming' && '🎮'} 
            {currentCategory === 'comedy' && '😂'} 
            {currentCategory === 'tech' && '💻'} 
            {currentCategory === 'education' && '📚'} 
            {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}
            <span style={{ fontSize: '0.7rem' }}>▼</span>
          </button>

          {/* Video Counter */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '6px 12px',
            color: '#fff',
            fontSize: '0.8rem'
          }}>
            {currentVideoIndex + 1} / {shortsData.length}
          </div>
        </div>

        {/* Category Menu Dropdown */}
        {showCategoryMenu && (
          <div style={{
            position: 'absolute',
            top: '70px',
            left: '20px',
            zIndex: 101,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {['trending', 'gaming', 'comedy', 'tech', 'education'].map(category => (
              <button
                key={category}
                onClick={() => {
                  changeCategory(category);
                  setShowCategoryMenu(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  background: currentCategory === category ? 
                    'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 
                    'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentCategory !== category) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentCategory !== category) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {category === 'trending' && '🔥'} 
                {category === 'gaming' && '🎮'} 
                {category === 'comedy' && '😂'} 
                {category === 'tech' && '💻'} 
                {category === 'education' && '📚'} 
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
            <div style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '12px 0'
            }} />
            <button
              onClick={() => {
                refreshShorts();
                setShowCategoryMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🔄 Refresh Videos
            </button>
          </div>
        )}

              {/* Full Screen Video Player */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={togglePlay}
        >
        {/* Real YouTube Video Player */}
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: '#000'
        }}>
          {currentVideo.embedUrl ? (
            <iframe
              src={currentVideo.embedUrl + '&autoplay=0&mute=0'}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '0'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentVideo.title}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${currentVideo.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Fallback Play Button */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => window.open(currentVideo.watchUrl, '_blank')}
              >
                ▶️
              </div>
            </div>
          )}

          {/* Video Info Overlay */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* Trending Badge */}
            {currentVideo.trending && (
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                🔥 Trending
              </div>
            )}
            
            {/* View Count */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '0.8rem'
            }}>
              👁️ {currentVideo.views || '0'} views
            </div>
          </div>
        </div>

        {/* Swipe Indicators - Only show for first few videos */}
        {currentVideoIndex < 3 && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '2rem',
            textAlign: 'center',
            lineHeight: 1.2,
            opacity: 0.8
          }}>
            {currentVideoIndex > 0 && <div>⬆️</div>}
            <div style={{ 
              fontSize: '0.9rem', 
              margin: '15px 0',
              opacity: 0.7,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '8px 16px'
            }}>
              Swipe for {shortsData.length - currentVideoIndex - 1} more videos
            </div>
            {currentVideoIndex < shortsData.length - 1 && <div>⬇️</div>}
          </div>
        )}
      </div>

        {/* Right Side Actions - Minimal */}
        <div style={{
          position: 'absolute',
          right: '16px',
          bottom: '100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 50,
          pointerEvents: 'auto' // Enable clicks on action buttons
        }}>
          {/* Like */}
          <div 
            onClick={handleLike}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <div style={{
              fontSize: '1.8rem',
              marginBottom: '4px',
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
            }}>
              ❤️
            </div>
            <div style={{ 
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '600',
              textShadow: '0 0 8px rgba(0,0,0,0.8)'
            }}>
              {currentVideo.likes}
            </div>
          </div>

          {/* Comments */}
          <div 
            onClick={() => setShowComments(!showComments)}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <div style={{
              fontSize: '1.8rem',
              marginBottom: '4px',
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
            }}>
              💬
            </div>
            <div style={{ 
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '600',
              textShadow: '0 0 8px rgba(0,0,0,0.8)'
            }}>
              {currentVideo.comments}
            </div>
          </div>

          {/* Share */}
          <div 
            onClick={handleShare}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <div style={{
              fontSize: '1.8rem',
              marginBottom: '4px',
              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
            }}>
              📤
            </div>
            <div style={{ 
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '600',
              textShadow: '0 0 8px rgba(0,0,0,0.8)'
            }}>
              {currentVideo.shares}
            </div>
          </div>
        </div>

        {/* Bottom Info - Minimal */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '80px', // Leave space for right actions
          color: '#fff',
          zIndex: 50
        }}>
          {/* Creator & Title */}
          <div style={{
            marginBottom: '8px'
          }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              marginBottom: '4px',
              textShadow: '0 0 8px rgba(0,0,0,0.8)'
            }}>
              {currentVideo.creator}
            </div>
            <div style={{
              fontSize: '0.85rem',
              lineHeight: 1.3,
              opacity: 0.9,
              textShadow: '0 0 8px rgba(0,0,0,0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {currentVideo.title}
            </div>
          </div>

          {/* Category & Duration Pills */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {currentVideo.category === 'Gaming' && '🎮'} 
              {currentVideo.category === 'Tech' && '💻'} 
              {currentVideo.category === 'Comedy' && '😂'} 
              {currentVideo.category === 'Education' && '📚'} 
              {currentVideo.category || 'Video'}
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {currentVideo.duration}
            </div>
          </div>
        </div>

        {/* Play/Pause Overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            pointerEvents: 'none' // Let clicks pass through to video player
          }}
        >
          {!isPlaying && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              pointerEvents: 'auto', // Enable clicks on play button
              cursor: 'pointer'
            }}>
              ▶️
            </div>
          )}
        </div>

      {/* Comments Modal */}
      {showComments && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px 20px 0 0',
          padding: '1.5rem',
          maxHeight: '50vh',
          overflowY: 'auto',
          zIndex: 200
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h4 style={{
              color: 'var(--text-primary)',
              margin: 0,
              fontSize: '1.1rem'
            }}>
              💬 Comments ({currentVideo.comments})
            </h4>
            <button
              onClick={() => setShowComments(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {/* Sample Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { user: '@GamerKid', text: 'This is so cool! 🔥', likes: '234' },
              { user: '@TechReviewer', text: 'Amazing content as always 👏', likes: '156' },
              { user: '@StudyBuddy', text: 'Thanks for the tips! 📚', likes: '89' }
            ].map((comment, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '10px',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem'
                }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {comment.user}
                  </div>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginBottom: '4px'
                  }}>
                    {comment.text}
                  </div>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem'
                  }}>
                    ❤️ {comment.likes} likes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortsPlayer; 