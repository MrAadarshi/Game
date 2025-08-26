import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EntertainmentZone = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('trending');
  const [videos, setVideos] = useState([]);
  const [memes, setMemes] = useState([]);
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    // Simulated entertainment content
    setVideos([
      {
        id: 1,
        title: "Epic Aviator 50x Win Compilation! 🚀",
        thumbnail: "🎮",
        duration: "3:45",
        views: "12.5K",
        category: "gaming",
        description: "Watch the most insane Aviator wins ever!"
      },
      {
        id: 2,
        title: "Pro Gaming Tips That Actually Work",
        thumbnail: "🎯",
        duration: "8:20",
        views: "45.2K",
        category: "tutorial",
        description: "Level up your gaming skills with these proven strategies"
      },
      {
        id: 3,
        title: "Funniest Gaming Fails of 2024",
        thumbnail: "😂",
        duration: "5:12",
        views: "89.1K",
        category: "funny",
        description: "You won't stop laughing at these epic fails!"
      }
    ]);

    setMemes([
      {
        id: 1,
        title: "When you bet 1000 coins and plane crashes at 1.01x",
        image: "😭",
        likes: 1234,
        category: "relatable"
      },
      {
        id: 2,
        title: "Me explaining my 'strategy' after losing 10 games straight",
        image: "🤡",
        likes: 892,
        category: "funny"
      },
      {
        id: 3,
        title: "That feeling when you cash out at the perfect moment",
        image: "😎",
        likes: 2156,
        category: "victory"
      }
    ]);

    setPolls([
      {
        id: 1,
        question: "What's your favorite game on the platform?",
        options: [
          { text: "Aviator", votes: 45 },
          { text: "Dice Roll", votes: 23 },
          { text: "Color Prediction", votes: 32 }
        ],
        totalVotes: 100
      },
      {
        id: 2,
        question: "Best time to play games?",
        options: [
          { text: "Morning", votes: 15 },
          { text: "Afternoon", votes: 35 },
          { text: "Evening", votes: 50 }
        ],
        totalVotes: 100
      }
    ]);
  }, []);

  const AdBanner = ({ type, position }) => (
    <div style={{
      background: type === 'video' ? 
        'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' :
        'linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%)',
      borderRadius: '12px',
      padding: '16px',
      margin: '16px 0',
      color: 'white',
      textAlign: 'center',
      border: '2px dashed rgba(255,255,255,0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'scale(1.02)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'scale(1)';
    }}
    >
      <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '8px' }}>
        Sponsored Content
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
        {type === 'video' ? '🎬 Free Movies & Shows - Stream Now!' : '📱 Latest Smartphones - 70% Off!'}
      </div>
      <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
        {type === 'video' ? 'Watch unlimited content with friends' : 'Limited time offer - Grab yours today!'}
      </div>
    </div>
  );

  const VideoCard = ({ video, index }) => (
    <div key={video.id}>
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '16px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        {/* Video Thumbnail */}
        <div style={{
          height: '200px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          position: 'relative'
        }}>
          {video.thumbnail}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            {video.duration}
          </div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            ▶️
          </div>
        </div>

        {/* Video Info */}
        <div style={{ padding: '16px' }}>
          <h3 style={{
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            lineHeight: '1.3'
          }}>
            {video.title}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0 0 12px 0',
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            {video.description}
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            <span>👁️ {video.views} views</span>
            <span style={{
              background: 'var(--accent-gradient)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              textTransform: 'capitalize'
            }}>
              {video.category}
            </span>
          </div>
        </div>
      </div>

      {/* Insert ad after every 2nd video */}
      {(index + 1) % 2 === 0 && <AdBanner type="video" position={index} />}
    </div>
  );

  const MemeCard = ({ meme, index }) => (
    <div key={meme.id}>
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--border-color)',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      >
        {/* Meme Content */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '6rem',
            marginBottom: '16px'
          }}>
            {meme.image}
          </div>
          <h3 style={{
            color: 'var(--text-primary)',
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            lineHeight: '1.3'
          }}>
            {meme.title}
          </h3>
        </div>

        {/* Meme Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '1rem',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            😂 {meme.likes}
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            🔄 Share
          </button>
          <span style={{
            background: 'var(--accent-gradient)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            textTransform: 'capitalize'
          }}>
            {meme.category}
          </span>
        </div>
      </div>

      {/* Insert ad after every 3rd meme */}
      {(index + 1) % 3 === 0 && <AdBanner type="product" position={index} />}
    </div>
  );

  const PollCard = ({ poll }) => (
    <div style={{
      background: 'var(--glass-bg)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border-color)',
      marginBottom: '20px'
    }}>
      <h3 style={{
        color: 'var(--text-primary)',
        margin: '0 0 16px 0',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        📊 {poll.question}
      </h3>

      {poll.options.map((option, index) => (
        <div key={index} style={{
          marginBottom: '12px',
          cursor: 'pointer'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{ color: 'var(--text-primary)' }}>{option.text}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {option.votes} votes
            </span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'var(--accent-gradient)',
              height: '100%',
              width: `${(option.votes / poll.totalVotes) * 100}%`,
              borderRadius: '8px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      ))}

      <div style={{
        textAlign: 'center',
        marginTop: '16px',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        Total votes: {poll.totalVotes}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎬 Entertainment Zone
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0,
            fontSize: '1.2rem'
          }}>
            Trending videos, hilarious memes, and interactive content!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {/* Shorts Link */}
          <Link
            to="/shorts"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#fff',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flex: '1',
              minWidth: '140px',
              textAlign: 'center',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              📱 Shorts
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              🔥 Watch & earn coins
            </div>
          </Link>

          {/* Regular Tabs */}
          {[
            { id: 'trending', label: '🔥 Trending', desc: 'Hot content now' },
            { id: 'videos', label: '🎥 Videos', desc: 'Gaming & entertainment' },
            { id: 'memes', label: '😂 Memes', desc: 'Laugh out loud' },
            { id: 'polls', label: '📊 Polls', desc: 'Vote & share opinions' },
            { id: 'challenges', label: '⚡ Challenges', desc: 'Daily fun tasks' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                background: activeSection === tab.id ? 'var(--accent-gradient)' : 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: activeSection === tab.id ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: '1',
                minWidth: '140px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {tab.label}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                opacity: activeSection === tab.id ? 0.9 : 0.7 
              }}>
                {tab.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {activeSection === 'videos' && videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}

          {activeSection === 'memes' && memes.map((meme, index) => (
            <MemeCard key={meme.id} meme={meme} index={index} />
          ))}

          {activeSection === 'polls' && polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}

          {activeSection === 'trending' && (
            <>
              <div style={{
                gridColumn: '1 / -1',
                background: 'var(--glass-bg)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                  🔥 What's Trending Now
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {['Epic Gaming Wins', 'Funny Fails', 'Pro Tips', 'Community Challenges'].map((trend, index) => (
                    <div key={index} style={{
                      background: 'var(--accent-gradient)',
                      borderRadius: '12px',
                      padding: '16px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                        {['🎮', '😂', '🎯', '⚡'][index]}
                      </div>
                      <div style={{ fontWeight: 'bold' }}>{trend}</div>
                    </div>
                  ))}
                </div>
              </div>
              {videos.slice(0, 2).map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
              {memes.slice(0, 2).map((meme, index) => (
                <MemeCard key={meme.id} meme={meme} index={index} />
              ))}
            </>
          )}

          {activeSection === 'challenges' && (
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--glass-bg)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-color)'
            }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px', textAlign: 'center' }}>
                ⚡ Daily Challenges
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {[
                  { title: 'Meme Creator', desc: 'Create and share 3 gaming memes', reward: '100 coins', icon: '😂' },
                  { title: 'Video Watcher', desc: 'Watch 5 trending videos', reward: '75 coins', icon: '🎥' },
                  { title: 'Poll Participant', desc: 'Vote in 3 community polls', reward: '50 coins', icon: '📊' },
                  { title: 'Social Butterfly', desc: 'Like and comment on 10 posts', reward: '125 coins', icon: '👥' }
                ].map((challenge, index) => (
                  <div key={index} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{challenge.icon}</div>
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{challenge.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                      {challenge.desc}
                    </p>
                    <div style={{
                      background: 'var(--accent-green)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      Reward: {challenge.reward}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Ad */}
        <AdBanner type="product" position="bottom" />
      </div>
    </div>
  );
};

export default EntertainmentZone; 