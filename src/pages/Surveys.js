import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';
import bitlabsService from '../services/bitlabsService';
import BITLABS_CONFIG from '../config/bitlabsConfig';

const Surveys = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coins, updateVirtualBalance } = useVirtualCurrency();
  const [availableSurveys, setAvailableSurveys] = useState([]);
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bitlabsInitialized, setBitlabsInitialized] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userStats, setUserStats] = useState({
    completedCount: 0,
    totalEarnings: 0,
    availableCount: 0,
    completionRate: 0
  });

  // Initialize BitLabs and load surveys
  useEffect(() => {
    if (user?.uid) {
      // Immediately load fallback surveys to show something while initializing
      const fallbackSurveys = [
        {
          id: 'survey-001',
          title: 'Consumer Preferences Survey',
          description: 'Help brands understand consumer behavior and preferences',
          reward: 1.50,
          timeEstimate: '8 min',
          category: 'Market Research',
          icon: '📊',
          color: '#4CAF50',
          clickUrl: null,
          rating: 4,
          questions: [
            {
              id: 1,
              question: 'Which social media platform do you use most frequently?',
              type: 'single-choice',
              options: ['Facebook', 'Instagram', 'Twitter', 'TikTok', 'LinkedIn', 'YouTube']
            },
            {
              id: 2,
              question: 'How often do you make online purchases?',
              type: 'single-choice',
              options: ['Daily', 'Weekly', 'Monthly', 'Few times a year', 'Rarely']
            },
            {
              id: 3,
              question: 'What influences your purchasing decisions most?',
              type: 'single-choice',
              options: ['Price', 'Quality', 'Brand reputation', 'Reviews', 'Recommendations']
            }
          ]
        },
        {
          id: 'survey-002',
          title: 'Technology Usage Study',
          description: 'Share your experience with technology and digital services',
          reward: 2.25,
          timeEstimate: '12 min',
          category: 'Technology',
          icon: '💻',
          color: '#2196F3',
          clickUrl: null,
          rating: 5,
          questions: [
            {
              id: 1,
              question: 'Which device do you use most for internet browsing?',
              type: 'single-choice',
              options: ['Smartphone', 'Laptop', 'Desktop Computer', 'Tablet']
            },
            {
              id: 2,
              question: 'How comfortable are you with AI technology?',
              type: 'single-choice',
              options: ['Very comfortable', 'Somewhat comfortable', 'Neutral', 'Uncomfortable', 'Very uncomfortable']
            }
          ]
        },
        {
          id: 'survey-003',
          title: 'Lifestyle & Wellness Survey',
          description: 'Tell us about your daily habits and wellness preferences',
          reward: 1.75,
          timeEstimate: '10 min',
          category: 'Health & Lifestyle',
          icon: '🌿',
          color: '#8BC34A',
          clickUrl: null,
          rating: 4,
          questions: [
            {
              id: 1,
              question: 'How often do you exercise per week?',
              type: 'single-choice',
              options: ['Daily', '4-6 times', '2-3 times', 'Once a week', 'Rarely/Never']
            },
            {
              id: 2,
              question: 'What type of exercise do you prefer?',
              type: 'single-choice',
              options: ['Cardio', 'Weight training', 'Yoga/Pilates', 'Sports', 'Walking/Hiking']
            }
          ]
        }
      ];
      
      setAvailableSurveys(fallbackSurveys);
      loadCompletedSurveys();
      setLoading(false);
      
      // Then try to initialize BitLabs in the background
      initializeBitLabs();
    }
  }, [user]);

  const initializeBitLabs = async () => {
    console.log('🚀 Starting BitLabs initialization...');
    
    try {
      // Try to initialize BitLabs SDK (this will run in background)
      const initResult = await bitlabsService.initializeSDK(user.uid, user.displayName || user.email);
      setBitlabsInitialized(true);
      
      if (initResult.fallback) {
        console.log('📌 BitLabs running in fallback mode (direct offerwall access)');
      } else {
        console.log('✅ BitLabs SDK initialized successfully!');
      }
      
      // Setup callbacks for survey completion
      bitlabsService.registerCallback('onReward', handleSurveyReward);
      
      // Test offerwall access
      await bitlabsService.testOfferwallAccess(user.uid);
      
      // Try to load hybrid surveys (embedded + BitLabs)
      const hybridSurveys = await bitlabsService.getAvailableSurveys(user.uid);
      if (hybridSurveys && hybridSurveys.length > 0) {
        console.log('📋 Loaded hybrid surveys:', hybridSurveys.length);
        setAvailableSurveys(hybridSurveys);
      }
      
      // Load user stats if possible
      loadUserStats();
      
    } catch (error) {
      console.error('❌ BitLabs initialization failed (using embedded surveys only):', error);
      setBitlabsInitialized(false);
      // Keep the surveys that are already loaded (embedded ones)
    }
  };

  const loadAvailableSurveys = async () => {
    try {
      const surveys = await bitlabsService.getAvailableSurveys(user.uid);
      setAvailableSurveys(surveys);
    } catch (error) {
      console.error('Error loading surveys:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await bitlabsService.getUserStats(user.uid);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadCompletedSurveys = () => {
    const completed = JSON.parse(localStorage.getItem(`completedSurveys_${user?.uid}`) || '[]');
    setCompletedSurveys(completed);
  };

  const handleSurveyReward = (reward) => {
    console.log('Survey reward received:', reward);
    updateVirtualBalance(reward);
    loadUserStats();
  };

  const startSurvey = (survey) => {
    // Check if this is the special BitLabs offerwall survey
    if (survey.isBitLabsOfferwall) {
      openBitLabsOfferwall();
      return;
    }

    // Regular embedded survey
    setActiveSurvey(survey);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const openBitLabsOfferwall = () => {
    if (!bitlabsInitialized) {
      alert('BitLabs is not properly initialized. Please check the setup.');
      return;
    }

    // Open BitLabs offerwall in a new window
    try {
      const offerwallUrl = `${BITLABS_CONFIG.OFFERWALL_URL}?token=${BITLABS_CONFIG.API_TOKEN}&uid=${user.uid}`;
      console.log('🚀 Opening BitLabs offerwall:', offerwallUrl);
      
      const offerwallWindow = window.open(
        offerwallUrl,
        'bitlabs_offerwall',
        'width=1000,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no'
      );

      if (!offerwallWindow) {
        alert('Pop-up blocked! Please allow pop-ups for this site to access BitLabs surveys.');
      } else {
        console.log('✅ BitLabs offerwall opened successfully');
      }
    } catch (error) {
      console.error('❌ Error opening BitLabs offerwall:', error);
      alert('Failed to open BitLabs offerwall. Please try again later.');
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < activeSurvey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Survey completed
      completeSurvey();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeSurvey = () => {
    // Mark survey as completed
    const newCompleted = [...completedSurveys, activeSurvey.id];
    setCompletedSurveys(newCompleted);
    localStorage.setItem(`completedSurveys_${user?.uid}`, JSON.stringify(newCompleted));

    // Award coins
    updateVirtualBalance(activeSurvey.reward);

    // Update stats
    setUserStats(prev => ({
      ...prev,
      completedCount: prev.completedCount + 1,
      totalEarnings: prev.totalEarnings + activeSurvey.reward
    }));

    // Close survey
    setActiveSurvey(null);
    setCurrentQuestion(0);
    setAnswers({});

    // Refresh available surveys
    loadAvailableSurveys();
  };

  const exitSurvey = () => {
    setActiveSurvey(null);
    setCurrentQuestion(0);
    setAnswers({});
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading BitLabs Surveys...
      </div>
    );
  }

  // Embedded Survey Component (like Chillar app)
  const EmbeddedSurvey = () => {
    if (!activeSurvey) return null;

    const currentQuestionData = activeSurvey.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / activeSurvey.questions.length) * 100;
    const isLastQuestion = currentQuestion === activeSurvey.questions.length - 1;
    const hasAnswer = answers[currentQuestionData.id];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Survey Header */}
          <div style={{
            padding: '2rem 2rem 1rem',
            borderBottom: '1px solid #f0f0f0',
            position: 'relative'
          }}>
            <button
              onClick={exitSurvey}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: activeSurvey.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginRight: '1rem'
              }}>
                {activeSurvey.icon}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#333' }}>
                  {activeSurvey.title}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                  Question {currentQuestion + 1} of {activeSurvey.questions.length}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: '#f0f0f0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Question Content */}
          <div style={{
            padding: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              color: '#333',
              marginBottom: '2rem',
              lineHeight: '1.4'
            }}>
              {currentQuestionData.question}
            </h3>

            {/* Answer Options */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionData.id, option)}
                  style={{
                    padding: '1rem 1.5rem',
                    border: answers[currentQuestionData.id] === option 
                      ? '2px solid #4CAF50' 
                      : '2px solid #e0e0e0',
                    borderRadius: '12px',
                    background: answers[currentQuestionData.id] === option 
                      ? '#f8fff8' 
                      : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    if (answers[currentQuestionData.id] !== option) {
                      e.target.style.borderColor = '#ddd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (answers[currentQuestionData.id] !== option) {
                      e.target.style.borderColor = '#e0e0e0';
                    }
                  }}
                >
                  <span>{option}</span>
                  {answers[currentQuestionData.id] === option && (
                    <span style={{ color: '#4CAF50', fontSize: '1.2rem' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{
            padding: '1rem 2rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              style={{
                padding: '12px 24px',
                background: currentQuestion === 0 ? '#f5f5f5' : '#e0e0e0',
                border: 'none',
                borderRadius: '25px',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                color: currentQuestion === 0 ? '#ccc' : '#666',
                fontWeight: '600'
              }}
            >
              Previous
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span>💰 ${activeSurvey.reward} reward</span>
              <span>⏱️ {activeSurvey.timeEstimate}</span>
            </div>

            <button
              onClick={nextQuestion}
              disabled={!hasAnswer}
              style={{
                padding: '12px 24px',
                background: hasAnswer 
                  ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
                  : '#f5f5f5',
                border: 'none',
                borderRadius: '25px',
                cursor: hasAnswer ? 'pointer' : 'not-allowed',
                color: hasAnswer ? 'white' : '#ccc',
                fontWeight: '600',
                boxShadow: hasAnswer ? '0 2px 10px rgba(76, 175, 80, 0.3)' : 'none'
              }}
            >
              {isLastQuestion ? 'Complete Survey' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingTop: '2rem',
      paddingBottom: '2rem',
      overflow: 'auto',
      zIndex: 1000
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
        `,
        zIndex: 1
      }} />

      {/* Header Section */}
      <div style={{
        padding: '2rem 2rem 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        width: '100%'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1001
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span>
          Back to Home
        </button>

        <div style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50px',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
            📊 Survey Hub - {bitlabsInitialized ? '✅ BitLabs Connected' : '⚠️ Demo Mode'} 💰
          </span>
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #ffffff, #f8f9fa, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 1rem 0',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          Welcome, {user?.displayName || 'Surveyor'}!
        </h1>

        <p style={{
          fontSize: '1.25rem',
          opacity: 0.9,
          color: 'white',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.5'
        }}>
          Complete real surveys powered by BitLabs and earn actual rewards!
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        padding: '0 2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Available</h3>
          <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {availableSurveys.filter(survey => !completedSurveys.includes(survey.id)).length}
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Completed</h3>
          <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {completedSurveys.length}
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
          <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Total Earned</h3>
          <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {coins.toFixed(2)} coins
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        padding: '3rem 2rem 2rem',
        position: 'relative',
        zIndex: 2,
        backdropFilter: 'blur(10px)',
        width: '100%',
        marginBottom: '2rem'
      }}>


        {/* BitLabs Status */}
        <div style={{
          background: bitlabsInitialized 
            ? 'rgba(76, 175, 80, 0.2)' 
            : 'rgba(255, 152, 0, 0.2)',
          border: bitlabsInitialized 
            ? '1px solid rgba(76, 175, 80, 0.4)' 
            : '1px solid rgba(255, 152, 0, 0.4)',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>
            {bitlabsInitialized ? '✅ BitLabs Status: Connected' : '🔄 BitLabs Status: Initializing...'}
          </h3>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
            {bitlabsInitialized 
              ? 'Ready to access real BitLabs surveys! Click the "Real BitLabs Surveys" card below.'
              : 'Setting up BitLabs integration... Please wait a moment.'
            }
          </p>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', opacity: 0.8 }}>
            API Token: {BITLABS_CONFIG.API_TOKEN ? `${BITLABS_CONFIG.API_TOKEN.substring(0, 8)}...` : 'Missing'}
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem',
            fontSize: '0.8rem', 
            opacity: 0.9,
            flexWrap: 'wrap'
          }}>
            {bitlabsInitialized ? (
              <>
                <span style={{ color: '#4CAF50' }}>✅ SDK Ready</span>
                <span style={{ color: '#4CAF50' }}>✅ Offerwall Available</span>
                <button
                  onClick={() => {
                    console.log('🔍 Manual BitLabs Debug:');
                    console.log('- Initialized:', bitlabsInitialized);
                    console.log('- User ID:', user.uid);
                    console.log('- API Token:', BITLABS_CONFIG.API_TOKEN.substring(0, 8) + '...');
                    console.log('- Offerwall URL:', `${BITLABS_CONFIG.OFFERWALL_URL}?token=${BITLABS_CONFIG.API_TOKEN}&uid=${user.uid}`);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  🐛 Debug Info
                </button>
              </>
            ) : (
              <span style={{ color: '#FF9800' }}>⏳ Loading SDK...</span>
            )}
          </div>
        </div>

        {/* Available Surveys */}
        {availableSurveys.filter(survey => !completedSurveys.includes(survey.id)).length > 0 ? (
          <div>
            <h2 style={{
              color: 'white',
              textAlign: 'center',
              marginBottom: '2rem',
              fontSize: '2rem',
              fontWeight: '600'
            }}>
              🎯 {bitlabsInitialized ? 'Real BitLabs Surveys' : 'Demo Surveys (Not Real BitLabs)'}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {availableSurveys.filter(survey => !completedSurveys.includes(survey.id)).map((survey) => (
                <div
                  key={survey.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '2rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onClick={() => startSurvey(survey)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '15px',
                      background: survey.color || '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      marginRight: '1rem'
                    }}>
                      {survey.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        color: 'white',
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.3rem',
                        fontWeight: '600'
                      }}>
                        {survey.title}
                      </h3>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        margin: 0,
                        fontSize: '0.9rem'
                      }}>
                        {survey.category}
                      </p>
                    </div>
                  </div>

                  <p style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '1.5rem',
                    lineHeight: '1.4'
                  }}>
                    {survey.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <span style={{
                        color: survey.isBitLabsOfferwall ? '#FF6B35' : '#4CAF50',
                        fontWeight: '600',
                        fontSize: '1.1rem'
                      }}>
                        {survey.isBitLabsOfferwall ? survey.reward : `$${survey.reward}`}
                      </span>
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {survey.timeEstimate}
                      </span>
                      {survey.isBitLabsOfferwall && (
                        <span style={{
                          background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          REAL REWARDS
                        </span>
                      )}
                      {!survey.isBitLabsOfferwall && (
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          DEMO
                        </span>
                      )}
                    </div>

                    {survey.rating && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {'⭐'.repeat(survey.rating)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>No Surveys Available</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
              Check back later for new survey opportunities!
            </p>
            <button
              onClick={initializeBitLabs}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🔄 Refresh Surveys
            </button>
          </div>
        )}
      </div>

      {/* Embedded Survey Interface */}
      <EmbeddedSurvey />
    </div>
  );
};

export default Surveys; 