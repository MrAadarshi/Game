import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CommunityForum = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Simulated forum data
    setDiscussions([
      {
        id: 1,
        title: "Best Aviator Strategies - Share Your Tips! 🚀",
        author: "GameMaster2024",
        category: "Gaming Tips",
        replies: 47,
        views: 1234,
        lastReply: "2 hours ago",
        isHot: true,
        description: "Let's discuss the most effective strategies for Aviator game. What works for you?"
      },
      {
        id: 2,
        title: "Math Homework Help - Algebra Problems",
        author: "StudyBuddy",
        category: "Study Help", 
        replies: 23,
        views: 456,
        lastReply: "5 hours ago",
        isHot: false,
        description: "Struggling with quadratic equations? Let's help each other out!"
      },
      {
        id: 3,
        title: "Weekend Tournament - Who's joining? 🏆",
        author: "TournamentPro",
        category: "Events",
        replies: 89,
        views: 2341,
        lastReply: "30 minutes ago",
        isHot: true,
        description: "Big tournament this weekend! Entry fee: 500 coins, Prize pool: 50,000 coins!"
      }
    ]);

    setStudyGroups([
      {
        id: 1,
        name: "Math Study Circle",
        subject: "Mathematics",
        members: 24,
        nextSession: "Today 6 PM",
        description: "Daily math problem solving sessions. All grades welcome!",
        isActive: true
      },
      {
        id: 2,
        name: "Science Experiments Club",
        subject: "Science",
        members: 18,
        nextSession: "Tomorrow 4 PM", 
        description: "Fun science experiments and project discussions",
        isActive: true
      },
      {
        id: 3,
        name: "English Literature Discussion",
        subject: "English",
        members: 31,
        nextSession: "Friday 5 PM",
        description: "Book discussions, essay help, and writing tips",
        isActive: false
      }
    ]);

    setTeams([
      {
        id: 1,
        name: "Lightning Gamers",
        game: "Aviator",
        members: 3,
        maxMembers: 5,
        skill: "Intermediate",
        description: "Looking for consistent players for daily tournaments",
        leader: "SpeedGamer"
      },
      {
        id: 2,
        name: "Study Warriors",
        game: "Mixed Games",
        members: 4,
        maxMembers: 6,
        skill: "Beginner",
        description: "Balancing gaming and studies - responsible gaming group",
        leader: "SmartPlayer"
      }
    ]);
  }, []);

  const AdBanner = ({ type }) => (
    <div style={{
      background: type === 'study' ? 
        'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' :
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
        {type === 'study' ? '📚 Online Courses - 80% Off!' : '🎮 Gaming Accessories Sale!'}
      </div>
      <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
        {type === 'study' ? 'Boost your grades with expert tutoring' : 'Upgrade your gaming setup today'}
      </div>
    </div>
  );

  const DiscussionCard = ({ discussion, index }) => (
    <div key={discussion.id}>
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: discussion.isHot ? '2px solid var(--accent-red)' : '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        {discussion.isHot && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '16px',
            background: 'var(--accent-red)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            🔥 Hot Topic
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              color: 'var(--text-primary)',
              margin: '0 0 8px 0',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              lineHeight: '1.3'
            }}>
              {discussion.title}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              margin: '0 0 12px 0',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              {discussion.description}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              <span>👤 By {discussion.author}</span>
              <span style={{
                background: 'var(--accent-gradient)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}>
                {discussion.category}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>💬 {discussion.replies} replies</span>
            <span>👁️ {discussion.views} views</span>
          </div>
          <span>🕒 {discussion.lastReply}</span>
        </div>
      </div>

      {/* Insert ad after every 3rd discussion */}
      {(index + 1) % 3 === 0 && <AdBanner type="study" />}
    </div>
  );

  const StudyGroupCard = ({ group }) => (
    <div style={{
      background: 'var(--glass-bg)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border-color)',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div>
          <h3 style={{
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            📚 {group.name}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0 0 12px 0',
            fontSize: '0.9rem'
          }}>
            {group.description}
          </p>
        </div>
        <div style={{
          background: group.isActive ? 'var(--accent-green)' : 'var(--glass-bg)',
          color: group.isActive ? 'white' : 'var(--text-secondary)',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {group.isActive ? '🟢 Active' : '⭕ Inactive'}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <span>👥 {group.members} members</span>
          <span>📖 {group.subject}</span>
        </div>
        <span style={{
          color: 'var(--accent-blue)',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          📅 {group.nextSession}
        </span>
      </div>

      <button style={{
        background: 'var(--accent-gradient)',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%'
      }}>
        Join Study Group
      </button>
    </div>
  );

  const TeamCard = ({ team }) => (
    <div style={{
      background: 'var(--glass-bg)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border-color)',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div>
          <h3 style={{
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ⚡ {team.name}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0 0 12px 0',
            fontSize: '0.9rem'
          }}>
            {team.description}
          </p>
        </div>
        <div style={{
          background: 'var(--accent-purple)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {team.skill}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <span>🎮 {team.game}</span>
        <span>👤 Leader: {team.leader}</span>
        <span>👥 {team.members}/{team.maxMembers}</span>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        height: '8px',
        marginBottom: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'var(--accent-gradient)',
          height: '100%',
          width: `${(team.members / team.maxMembers) * 100}%`,
          borderRadius: '8px'
        }} />
      </div>

      <button style={{
        background: team.members < team.maxMembers ? 'var(--accent-green)' : 'var(--glass-bg)',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        color: team.members < team.maxMembers ? 'white' : 'var(--text-secondary)',
        fontWeight: 'bold',
        cursor: team.members < team.maxMembers ? 'pointer' : 'not-allowed',
        width: '100%'
      }}
      disabled={team.members >= team.maxMembers}
      >
        {team.members < team.maxMembers ? 'Join Team' : 'Team Full'}
      </button>
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
            background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            💬 Community Forum
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0,
            fontSize: '1.2rem'
          }}>
            Connect, learn, and grow together with fellow gamers and students!
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
            { id: 'discussions', label: '💬 Discussions', desc: 'Gaming & general chat' },
            { id: 'study', label: '📚 Study Groups', desc: 'Homework help' },
            { id: 'teams', label: '⚡ Team Formation', desc: 'Find gaming partners' },
            { id: 'events', label: '🎉 Events', desc: 'Community activities' }
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

        {/* Create New Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
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
              transition: 'all 0.3s ease'
            }}
          >
            ✨ Start New {activeTab === 'discussions' ? 'Discussion' : 
                          activeTab === 'study' ? 'Study Group' : 
                          activeTab === 'teams' ? 'Team' : 'Event'}
          </button>
        </div>

        {/* Content Areas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'discussions' ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {activeTab === 'discussions' && discussions.map((discussion, index) => (
            <DiscussionCard key={discussion.id} discussion={discussion} index={index} />
          ))}

          {activeTab === 'study' && studyGroups.map((group) => (
            <StudyGroupCard key={group.id} group={group} />
          ))}

          {activeTab === 'teams' && teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}

          {activeTab === 'events' && (
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--glass-bg)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>
                🎉 Upcoming Community Events
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {[
                  { title: 'Weekend Tournament', date: 'This Saturday', participants: '150+', prize: '50K coins' },
                  { title: 'Study Marathon', date: 'Next Monday', participants: '80+', prize: 'Certificates' },
                  { title: 'Meme Contest', date: 'Every Friday', participants: '200+', prize: '5K coins' },
                  { title: 'Live Gaming Session', date: 'Daily 8 PM', participants: '300+', prize: 'Fun & Learning' }
                ].map((event, index) => (
                  <div key={index} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{event.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0' }}>
                      📅 {event.date}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0' }}>
                      👥 {event.participants} expected
                    </p>
                    <p style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold', margin: '4px 0' }}>
                      🏆 {event.prize}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Ad */}
        <AdBanner type="gaming" />
      </div>
    </div>
  );
};

export default CommunityForum; 