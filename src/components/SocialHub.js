import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';

const SocialHub = () => {
  const { user } = useAuth();
  const { coins } = useVirtualCurrency();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Simulated social posts data
  useEffect(() => {
    const simulatedPosts = [
      {
        id: 1,
        user: 'GamerBoy123',
        avatar: '🎮',
        content: 'Just hit 10x multiplier in Aviator! 🚀 Who can beat this?',
        timestamp: '2 hours ago',
        likes: 23,
        comments: 5,
        type: 'achievement',
        achievement: { name: 'High Roller', icon: '💎' }
      },
      {
        id: 2,
        user: 'CoinMaster',
        avatar: '🎯',
        content: 'Daily challenge completed! 💪 Got 500 bonus coins',
        timestamp: '4 hours ago',
        likes: 15,
        comments: 2,
        type: 'daily_challenge'
      },
      {
        id: 3,
        user: 'LuckyPlayer',
        avatar: '🍀',
        content: 'OMG! Just won 5000 coins in the lottery! My strategy finally worked 😎',
        timestamp: '6 hours ago',
        likes: 45,
        comments: 12,
        type: 'big_win'
      },
      {
        id: 4,
        user: 'StrategyQueen',
        avatar: '👑',
        content: 'Pro tip: Start with small bets in Aviator and gradually increase. Works every time! 🧠',
        timestamp: '8 hours ago',
        likes: 67,
        comments: 23,
        type: 'tip'
      },
      {
        id: 5,
        user: 'TeamPlayer',
        avatar: '🤝',
        content: 'Looking for teammates for tomorrow\'s tournament! Drop your usernames below 👇',
        timestamp: '10 hours ago',
        likes: 34,
        comments: 18,
        type: 'team_search'
      }
    ];
    setPosts(simulatedPosts);
  }, []);

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now(),
        user: user?.email?.split('@')[0] || 'Anonymous',
        avatar: '😎',
        content: newPost,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        type: 'user_post'
      };
      setPosts([post, ...posts]);
      setNewPost('');
      setShowCreatePost(false);
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const AdBanner = ({ position }) => (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '16px',
      margin: '16px 0',
      color: 'white',
      textAlign: 'center',
      border: '2px dashed rgba(255,255,255,0.3)',
      cursor: 'pointer'
    }}>
      <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '8px' }}>
        Sponsored Content
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
        🎮 New Gaming Gear - 50% Off Today!
      </div>
      <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
        Click to explore amazing deals on gaming accessories
      </div>
    </div>
  );

  const PostCard = ({ post, index }) => (
    <div key={post.id}>
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* User Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            marginRight: '12px'
          }}>
            {post.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {post.user}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {post.timestamp}
            </div>
          </div>
          {post.type === 'achievement' && (
            <div style={{
              marginLeft: 'auto',
              background: 'var(--accent-gold)',
              color: '#000',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {post.achievement.icon} {post.achievement.name}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div style={{
          color: 'var(--text-primary)',
          lineHeight: '1.5',
          marginBottom: '16px',
          fontSize: '1rem'
        }}>
          {post.content}
        </div>

        {/* Engagement */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => handleLike(post.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 107, 107, 0.1)';
              e.target.style.color = '#ff6b6b';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = 'var(--text-secondary)';
            }}
          >
            ❤️ {post.likes}
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem'
          }}>
            💬 {post.comments}
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem'
          }}>
            🔄 Share
          </button>
        </div>
      </div>

      {/* Insert ad after every 3rd post */}
      {(index + 1) % 3 === 0 && <AdBanner position={index} />}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            fontSize: '2rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🌟 Social Hub
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0,
            fontSize: '1.1rem'
          }}>
            Connect with fellow gamers and share your achievements!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'feed', label: '🏠 Feed', desc: 'Latest from friends' },
            { id: 'trending', label: '🔥 Trending', desc: 'Hot topics' },
            { id: 'achievements', label: '🏆 Achievements', desc: 'Recent wins' },
            { id: 'challenges', label: '⚡ Challenges', desc: 'Daily tasks' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--accent-gradient)' : 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: activeTab === tab.id ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: '1',
                minWidth: '150px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {tab.label}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                opacity: activeTab === tab.id ? 0.9 : 0.7 
              }}>
                {tab.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Create Post Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            style={{
              background: 'var(--accent-gradient)',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 24px',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ✨ Share Your Gaming Moment
          </button>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div style={{
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid var(--border-color)'
          }}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's your latest gaming achievement? Share your victory! 🎮"
              style={{
                width: '100%',
                minHeight: '100px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                resize: 'vertical',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCreatePost}
                style={{
                  background: 'var(--accent-green)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🚀 Post
              </button>
              <button
                onClick={() => setShowCreatePost(false)}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* User Stats Bar */}
        <div style={{
          background: 'var(--glass-bg)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {coins.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              💰 Coins
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {posts.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              📝 Posts
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              247
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              👥 Friends
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-purple)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              15
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              🏆 Achievements
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div>
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* Bottom Ad */}
        <AdBanner position="bottom" />

        {/* Load More */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px 24px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            📥 Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialHub; 