import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';

// Professional Coin Animation Styles
const coinAnimationStyles = `
  @keyframes coinBounce {
    0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
    20% { transform: translate(-50%, -50%) scale(1.2) rotate(72deg); opacity: 1; }
    40% { transform: translate(-50%, -50%) scale(0.9) rotate(144deg); opacity: 1; }
    60% { transform: translate(-50%, -50%) scale(1.1) rotate(216deg); opacity: 1; }
    80% { transform: translate(-50%, -50%) scale(0.95) rotate(288deg); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1) rotate(360deg); opacity: 0; }
  }
  
  @keyframes coinGlow {
    0% { filter: drop-shadow(0 0 10px #FFD700); }
    100% { filter: drop-shadow(0 0 20px #FFD700) drop-shadow(0 0 30px #FFA500); }
  }
  
  @keyframes fadeInScale {
    0% { transform: scale(0); opacity: 0; }
    20% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  
  @keyframes pulseGlow {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
    100% { transform: scale(2); opacity: 0; }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = coinAnimationStyles;
  document.head.appendChild(styleSheet);
}

const CoinGames = () => {
  const { user, updateCoins, coins } = useAuth();
  const { updateChallengeProgress, checkAchievement } = useRewards();
  
  // Game states
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalCoinsEarned: 0,
    bestScore: 0,
    gamesPlayedToday: 0,
    favoriteGame: 'None'
  });
  
  // Animation states for rewards
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  
  // Enhanced game states for all games
  const [currentGameData, setCurrentGameData] = useState({
    score: 0,
    timeLeft: 60,
    question: '',
    userAnswer: '',
    correctAnswer: 0,
    gameStarted: false,
    gameFinished: false,
    level: 1,
    streak: 0,
    combo: 0,
    lives: 3,
    // Game-specific states
    sequence: [],
    userSequence: [],
    showSequence: false,
    reactionStartTime: null,
    canClick: false,
    targetPosition: { x: 50, y: 50 },
    bubbles: [],
    collectables: [],
    scratchAreas: [],
    wheelSpinning: false,
    spinResult: null,
    gamePhase: 'instruction' // instruction, playing, completed
  });

  // Game categories with exciting new games only
  const gameCategories = {
    'Sports Games': [
      {
        id: '8_ball_pool',
        name: '8 Ball Pool',
        icon: '🎱',
        description: 'Classic billiards pool game',
        coinReward: '20-50 coins',
        difficulty: 'Medium',
        duration: '5 min',
        color: 'linear-gradient(135deg, #0c3483, #a2b6df)'
      },
      {
        id: 'archery_master',
        name: 'Archery Master',
        icon: '🏹',
        description: 'Hit bullseye targets',
        coinReward: '15-40 coins',
        difficulty: 'Medium',
        duration: '3 min',
        color: 'linear-gradient(135deg, #ff6b6b, #feca57)'
      },
      {
        id: 'carrom_board',
        name: 'Carrom Board',
        icon: '🥅',
        description: 'Strike and pocket carrom pieces',
        coinReward: '18-45 coins',
        difficulty: 'Medium',
        duration: '4 min',
        color: 'linear-gradient(135deg, #8e44ad, #3498db)'
      },
      {
        id: 'basketball_shoot',
        name: 'Basketball Shots',
        icon: '🏀',
        description: 'Score hoops for coins',
        coinReward: '12-35 coins',
        difficulty: 'Easy',
        duration: '2 min',
        color: 'linear-gradient(135deg, #e67e22, #f39c12)'
      }
    ],
    'Racing & Action': [
      {
        id: 'car_racing',
        name: 'Street Racer',
        icon: '🏎️',
        description: 'High-speed racing challenge',
        coinReward: '25-60 coins',
        difficulty: 'Hard',
        duration: '4 min',
        color: 'linear-gradient(135deg, #2c3e50, #34495e)'
      },
      {
        id: 'fps_shooter',
        name: 'Target Shooter',
        icon: '🔫',
        description: 'FPS target shooting',
        coinReward: '20-50 coins',
        difficulty: 'Hard',
        duration: '3 min',
        color: 'linear-gradient(135deg, #c0392b, #e74c3c)'
      },
      {
        id: 'bike_racing',
        name: 'Bike Racing',
        icon: '🏍️',
        description: 'Motorcycle racing thrills',
        coinReward: '22-55 coins',
        difficulty: 'Hard',
        duration: '4 min',
        color: 'linear-gradient(135deg, #27ae60, #2ecc71)'
      },
      {
        id: 'helicopter_pilot',
        name: 'Helicopter Pilot',
        icon: '🚁',
        description: 'Navigate through obstacles',
        coinReward: '30-70 coins',
        difficulty: 'Hard',
        duration: '5 min',
        color: 'linear-gradient(135deg, #16a085, #1abc9c)'
      }
    ],
    'Strategy Games': [
      {
        id: 'chess_master',
        name: 'Chess Master',
        icon: '♟️',
        description: 'Strategic chess battles',
        coinReward: '35-80 coins',
        difficulty: 'Hard',
        duration: '10 min',
        color: 'linear-gradient(135deg, #2c3e50, #bdc3c7)'
      },
      {
        id: 'rummy_cards',
        name: 'Rummy Cards',
        icon: '🃏',
        description: 'Classic card game strategy',
        coinReward: '25-60 coins',
        difficulty: 'Medium',
        duration: '6 min',
        color: 'linear-gradient(135deg, #8e44ad, #9b59b6)'
      },
      {
        id: 'checkers_game',
        name: 'Checkers',
        icon: '🔴',
        description: 'Classic checkers strategy',
        coinReward: '20-45 coins',
        difficulty: 'Medium',
        duration: '5 min',
        color: 'linear-gradient(135deg, #d35400, #e67e22)'
      },
      {
        id: 'tic_tac_toe',
        name: 'Tic Tac Toe',
        icon: '❌',
        description: 'Strategic X and O game',
        coinReward: '8-20 coins',
        difficulty: 'Easy',
        duration: '2 min',
        color: 'linear-gradient(135deg, #7f8c8d, #95a5a6)'
      }
    ],
    'Quiz & Knowledge': [
      {
        id: 'kbc_quiz',
        name: 'KBC Quiz',
        icon: '📺',
        description: 'Kaun Banega Crorepati style quiz',
        coinReward: '40-100 coins',
        difficulty: 'Hard',
        duration: '8 min',
        color: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
      },
      {
        id: 'general_knowledge',
        name: 'GK Challenge',
        icon: '🧠',
        description: 'Test your general knowledge',
        coinReward: '15-40 coins',
        difficulty: 'Medium',
        duration: '4 min',
        color: 'linear-gradient(135deg, #3498db, #2980b9)'
      },
      {
        id: 'sports_quiz',
        name: 'Sports Quiz',
        icon: '⚽',
        description: 'Sports trivia challenge',
        coinReward: '12-30 coins',
        difficulty: 'Medium',
        duration: '3 min',
        color: 'linear-gradient(135deg, #27ae60, #2ecc71)'
      },
      {
        id: 'bollywood_quiz',
        name: 'Bollywood Quiz',
        icon: '🎬',
        description: 'Movies and celebrities quiz',
        coinReward: '10-25 coins',
        difficulty: 'Easy',
        duration: '3 min',
        color: 'linear-gradient(135deg, #e67e22, #f39c12)'
      }
    ],
    'Adventure & Simulation': [
      {
        id: 'city_builder',
        name: 'City Builder',
        icon: '🏙️',
        description: 'Build and manage your city',
        coinReward: '30-75 coins',
        difficulty: 'Hard',
        duration: '8 min',
        color: 'linear-gradient(135deg, #34495e, #2c3e50)'
      },
      {
        id: 'treasure_hunter',
        name: 'Treasure Hunter',
        icon: '🗺️',
        description: 'Explore and find hidden treasures',
        coinReward: '25-65 coins',
        difficulty: 'Medium',
        duration: '6 min',
        color: 'linear-gradient(135deg, #f39c12, #e67e22)'
      },
      {
        id: 'survival_island',
        name: 'Survival Island',
        icon: '🏝️',
        description: 'Survive on a deserted island',
        coinReward: '35-85 coins',
        difficulty: 'Hard',
        duration: '10 min',
        color: 'linear-gradient(135deg, #16a085, #1abc9c)'
      },
      {
        id: 'space_explorer',
        name: 'Space Explorer',
        icon: '🚀',
        description: 'Explore galaxies and planets',
        coinReward: '40-90 coins',
        difficulty: 'Hard',
        duration: '7 min',
        color: 'linear-gradient(135deg, #8e44ad, #9b59b6)'
      }
    ],
    'Lucky Games': [
      {
        id: 'lucky_spin',
        name: 'Lucky Spin',
        icon: '🎰',
        description: 'Spin for instant coins',
        coinReward: '1-50 coins',
        difficulty: 'Luck',
        duration: '30 sec',
        color: 'linear-gradient(135deg, #ee9ca7, #ffdde1)'
      },
      {
        id: 'scratch_card',
        name: 'Scratch Card',
        icon: '🎫',
        description: 'Scratch to win coins',
        coinReward: '5-100 coins',
        difficulty: 'Luck',
        duration: '1 min',
        color: 'linear-gradient(135deg, #f093fb, #f5576c)'
      }
    ]
  };

  // Load saved stats
  useEffect(() => {
    const savedStats = localStorage.getItem(`coinGameStats_${user?.uid}`);
    if (savedStats) {
      try {
        setGameStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Error loading saved stats:', e);
      }
    }
  }, [user?.uid]);

  // Save stats when they change
  useEffect(() => {
    if (user?.uid && gameStats.totalGames > 0) {
      localStorage.setItem(`coinGameStats_${user.uid}`, JSON.stringify(gameStats));
    }
  }, [gameStats, user?.uid]);

  // Ad simulation function
  const showAdvertisement = (gameData) => {
    setSelectedGame(gameData);
    setShowAdModal(true);
    setAdCountdown(3); // Reduced from 5 to 3 seconds
    
    const countdown = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setShowAdModal(false);
          startGame(gameData);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Skip ad function
  const skipAd = () => {
    setShowAdModal(false);
    if (selectedGame) {
      startGame(selectedGame);
    }
  };

  // Start game after ad
  const startGame = (gameData) => {
    setGameInProgress(true);
    setCurrentGameData({
      score: 0,
      timeLeft: getGameDuration(gameData.id),
      question: '',
      userAnswer: '',
      correctAnswer: 0,
      gameStarted: true,
      gameFinished: false,
      level: 1,
      streak: 0,
      combo: 0,
      lives: 3,
      // Game-specific states
      sequence: [],
      userSequence: [],
      showSequence: false,
      reactionStartTime: null,
      canClick: false,
      targetPosition: { x: 50, y: 50 },
      bubbles: [],
      collectables: [],
      scratchAreas: [],
      wheelSpinning: false,
      spinResult: null,
      gamePhase: 'instruction' // instruction, playing, completed
    });
    
    // Initialize specific game
    initializeGame(gameData.id);
  };

  // Exit current game and return to game selection
  const exitGame = () => {
    setGameInProgress(false);
    setSelectedGame(null);
    setShowAdModal(false);
    setCurrentGameData({
      score: 0,
      timeLeft: 0,
      question: '',
      userAnswer: '',
      correctAnswer: 0,
      gameStarted: false,
      gameFinished: false,
      level: 1,
      streak: 0,
      combo: 0,
      lives: 3,
      sequence: [],
      userSequence: [],
      showSequence: false,
      reactionStartTime: null,
      canClick: false,
      targetPosition: { x: 50, y: 50 },
      bubbles: [],
      collectables: [],
      scratchAreas: [],
      wheelSpinning: false,
      spinResult: null,
      gamePhase: 'instruction'
    });
  };

  // Get game duration in seconds
  const getGameDuration = (gameId) => {
    switch(gameId) {
      case 'reaction_test': return 60;
      case 'lucky_spin': 
      case 'scratch_card': return 30;
      case 'quick_math':
      case 'word_puzzle':
      case 'bubble_pop':
      case 'target_shooter':
      case 'color_match': return 120;
      case 'typing_speed':
      case 'memory_challenge':
      case 'pattern_match':
      case 'coin_collector':
      case 'treasure_hunt': return 180;
      case 'logic_grid': return 240;
      case 'daily_challenge': return 300;
      default: return 120;
    }
  };

  // Initialize specific game logic based on game ID
  const initializeGame = (gameId) => {
    switch(gameId) {
      case '8_ball_pool':
        initializePoolGame();
        break;
      case 'chess_master':
        initializeChessGame();
        break;
      case 'kbc_quiz':
        initializeKBCQuiz();
        break;
      case 'car_racing':
        initializeRacingGame();
        break;
      case 'archery_master':
        initializeArcheryGame();
        break;
      case 'rummy_cards':
        initializeRummyGame();
        break;
      case 'fps_shooter':
        initializeFPSGame();
        break;
      case 'city_builder':
        initializeCityBuilder();
        break;
      case 'carrom_board':
        initializeCarromGame();
        break;
      case 'basketball_shoot':
        initializeBasketballGame();
        break;
      case 'bike_racing':
        initializeBikeRacing();
        break;
      case 'helicopter_pilot':
        initializeHelicopterGame();
        break;
      case 'checkers_game':
        initializeCheckersGame();
        break;
      case 'tic_tac_toe':
        initializeTicTacToe();
        break;
      case 'general_knowledge':
        initializeGKQuiz();
        break;
      case 'sports_quiz':
        initializeSportsQuiz();
        break;
      case 'bollywood_quiz':
        initializeBollywoodQuiz();
        break;
      case 'treasure_hunter':
        initializeTreasureHunter();
        break;
      case 'survival_island':
        initializeSurvivalIsland();
        break;
      case 'space_explorer':
        initializeSpaceExplorer();
        break;
      case 'lucky_spin':
        initializeLuckyWheel();
        break;
      case 'scratch_card':
        initializeScratchCard();
        break;
      default:
        initializeDefaultGame(); // Simple fallback
    }
  };

  // 8 Ball Pool Game Logic - Complete Implementation with Fixed Physics and Larger Size
  const initializePoolGame = () => {
    // Create proper 8-ball rack formation with larger balls and table
    const ballRadius = 12; // Increased from 8
    const tableWidth = 700; // Increased from 500
    const tableHeight = 500; // Increased from 400
    
    const balls = [
      // Cue ball - positioned for break shot
      { id: 0, x: 200, y: 250, vx: 0, vy: 0, color: '#FFFFFF', type: 'cue', pocketed: false, radius: ballRadius },
      
      // Racked balls in proper 8-ball formation with larger spacing
      { id: 1, x: 480, y: 250, vx: 0, vy: 0, color: '#FFD700', type: 'solid', number: 1, pocketed: false, radius: ballRadius },
      { id: 2, x: 504, y: 238, vx: 0, vy: 0, color: '#0000FF', type: 'solid', number: 2, pocketed: false, radius: ballRadius },
      { id: 3, x: 504, y: 262, vx: 0, vy: 0, color: '#FF0000', type: 'solid', number: 3, pocketed: false, radius: ballRadius },
      { id: 4, x: 528, y: 226, vx: 0, vy: 0, color: '#800080', type: 'solid', number: 4, pocketed: false, radius: ballRadius },
      { id: 5, x: 528, y: 250, vx: 0, vy: 0, color: '#FFA500', type: 'solid', number: 5, pocketed: false, radius: ballRadius },
      { id: 6, x: 528, y: 274, vx: 0, vy: 0, color: '#008000', type: 'solid', number: 6, pocketed: false, radius: ballRadius },
      { id: 7, x: 552, y: 214, vx: 0, vy: 0, color: '#8B4513', type: 'solid', number: 7, pocketed: false, radius: ballRadius },
      { id: 8, x: 552, y: 250, vx: 0, vy: 0, color: '#000000', type: '8ball', number: 8, pocketed: false, radius: ballRadius }, // 8 ball center
      { id: 9, x: 552, y: 238, vx: 0, vy: 0, color: '#FFFF00', type: 'stripe', number: 9, pocketed: false, radius: ballRadius },
      { id: 10, x: 552, y: 262, vx: 0, vy: 0, color: '#0000FF', type: 'stripe', number: 10, pocketed: false, radius: ballRadius },
      { id: 11, x: 552, y: 286, vx: 0, vy: 0, color: '#FF0000', type: 'stripe', number: 11, pocketed: false, radius: ballRadius },
      { id: 12, x: 576, y: 202, vx: 0, vy: 0, color: '#800080', type: 'stripe', number: 12, pocketed: false, radius: ballRadius },
      { id: 13, x: 576, y: 226, vx: 0, vy: 0, color: '#FFA500', type: 'stripe', number: 13, pocketed: false, radius: ballRadius },
      { id: 14, x: 576, y: 274, vx: 0, vy: 0, color: '#008000', type: 'stripe', number: 14, pocketed: false, radius: ballRadius },
      { id: 15, x: 576, y: 298, vx: 0, vy: 0, color: '#8B4513', type: 'stripe', number: 15, pocketed: false, radius: ballRadius }
    ];
    
    // Pool table pockets - adjusted for larger table with BIGGER pockets
    const pockets = [
      { x: 35, y: 35, radius: 28 },         // Top left - Increased from 20 to 28
      { x: 350, y: 25, radius: 24 },        // Top middle - Increased from 16 to 24
      { x: 665, y: 35, radius: 28 },        // Top right - Increased from 20 to 28
      { x: 35, y: 465, radius: 28 },        // Bottom left - Increased from 20 to 28
      { x: 350, y: 475, radius: 24 },       // Bottom middle - Increased from 16 to 24
      { x: 665, y: 465, radius: 28 }        // Bottom right - Increased from 20 to 28
    ];
    
    setCurrentGameData(prev => ({
      ...prev,
      poolBalls: balls,
      pockets: pockets,
      cueBall: balls[0],
      currentPlayer: 'player',
      gamePhase: 'aiming', // aiming, charging, ball_moving, game_over
      aimAngle: 0,
      power: 0,
      maxPower: 100,
      pocketedBalls: [],
      playerGroup: null, // 'solid' or 'stripe'
      aiGroup: null,
      currentTurn: 'player',
      gameWon: false,
      winner: null,
      ballsInMotion: false,
      cuePosition: { x: 160, y: 250 },
      mousePos: { x: 300, y: 250 },
      showCue: true,
      friction: 0.985,
      tableWidth: tableWidth,
      tableHeight: tableHeight,
      physicsRunning: false,
      shotCount: 0,
      gameStarted: true,
      ballRadius: ballRadius,
      powerPulse: 1.0,
      chargingStartTime: null
    }));
  };

  // Fixed Pool Physics Engine for Larger Table
  const updatePoolPhysics = () => {
    if (!currentGameData.poolBalls || currentGameData.gamePhase !== 'ball_moving') return;
    
    let ballsMoving = false;
    const balls = [...currentGameData.poolBalls];
    const pockets = currentGameData.pockets;
    const minVelocity = 0.05; // Threshold for stopping balls
    const tableWidth = currentGameData.tableWidth || 700;
    const tableHeight = currentGameData.tableHeight || 500;
    const ballRadius = currentGameData.ballRadius || 12;
    
    // Update ball positions and apply physics
    balls.forEach(ball => {
      if (ball.pocketed) return;
      
      // Apply velocity
      ball.x += ball.vx;
      ball.y += ball.vy;
      
      // Apply friction
      ball.vx *= currentGameData.friction;
      ball.vy *= currentGameData.friction;
      
      // Stop very slow balls to prevent infinite motion
      if (Math.abs(ball.vx) < minVelocity && Math.abs(ball.vy) < minVelocity) {
        ball.vx = 0;
        ball.vy = 0;
      }
      
      // Wall collisions with proper table rails - only small openings at pockets
      const pockets = currentGameData.pockets;
      
      // Check if ball is near any pocket before applying wall collision
      let nearPocket = false;
      if (pockets) {
        for (const pocket of pockets) {
          const dx = ball.x - pocket.x;
          const dy = ball.y - pocket.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          // If ball is within pocket radius + ball radius, it's near a pocket
          if (distance < pocket.radius + ballRadius + 5) {
            nearPocket = true;
            break;
          }
        }
      }
      
      // Apply wall collisions only if NOT near a pocket
      if (!nearPocket) {
        // Left wall
        if (ball.x - ballRadius <= 20) {
          ball.vx = Math.abs(ball.vx) * 0.8;
          ball.x = 20 + ballRadius;
        }
        // Right wall  
        if (ball.x + ballRadius >= tableWidth - 20) {
          ball.vx = -Math.abs(ball.vx) * 0.8;
          ball.x = tableWidth - 20 - ballRadius;
        }
        // Top wall
        if (ball.y - ballRadius <= 20) {
          ball.vy = Math.abs(ball.vy) * 0.8;
          ball.y = 20 + ballRadius;
        }
        // Bottom wall
        if (ball.y + ballRadius >= tableHeight - 20) {
          ball.vy = -Math.abs(ball.vy) * 0.8;
          ball.y = tableHeight - 20 - ballRadius;
        }
      }
      
      // Emergency boundary check - prevent balls from escaping table completely
      if (ball.x < 0) {
        console.warn(`⚠️ Ball ${ball.number || 'cue'} escaped left boundary! Resetting position.`);
        ball.x = ballRadius;
        ball.vx = Math.abs(ball.vx) * 0.5; // Reduce velocity
      }
      if (ball.x > tableWidth) {
        console.warn(`⚠️ Ball ${ball.number || 'cue'} escaped right boundary! Resetting position.`);
        ball.x = tableWidth - ballRadius;
        ball.vx = -Math.abs(ball.vx) * 0.5;
      }
      if (ball.y < 0) {
        console.warn(`⚠️ Ball ${ball.number || 'cue'} escaped top boundary! Resetting position.`);
        ball.y = ballRadius;
        ball.vy = Math.abs(ball.vy) * 0.5;
      }
      if (ball.y > tableHeight) {
        console.warn(`⚠️ Ball ${ball.number || 'cue'} escaped bottom boundary! Resetting position.`);
        ball.y = tableHeight - ballRadius;
        ball.vy = -Math.abs(ball.vy) * 0.5;
      }
      
      // Check if ball is still moving
      if (Math.abs(ball.vx) > minVelocity || Math.abs(ball.vy) > minVelocity) {
        ballsMoving = true;
      }
    });
    
    // Ball-to-ball collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        if (balls[i].pocketed || balls[j].pocketed) continue;
        
        const dx = balls[j].x - balls[i].x;
        const dy = balls[j].y - balls[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < ballRadius * 2) {
          // Collision detected
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);
          
          // Rotate velocities
          const vx1 = balls[i].vx * cos + balls[i].vy * sin;
          const vy1 = balls[i].vy * cos - balls[i].vx * sin;
          const vx2 = balls[j].vx * cos + balls[j].vy * sin;
          const vy2 = balls[j].vy * cos - balls[j].vx * sin;
          
          // Swap velocities (elastic collision)
          balls[i].vx = vx2 * cos - vy1 * sin;
          balls[i].vy = vy1 * cos + vx2 * sin;
          balls[j].vx = vx1 * cos - vy2 * sin;
          balls[j].vy = vy2 * cos + vx1 * sin;
          
          // Separate balls to prevent overlap
          const overlap = ballRadius * 2 - distance + 0.5;
          const separationX = overlap * 0.5 * cos;
          const separationY = overlap * 0.5 * sin;
          
          balls[i].x -= separationX;
          balls[i].y -= separationY;
          balls[j].x += separationX;
          balls[j].y += separationY;
        }
      }
    }
    
    // Check for pocketed balls with more forgiving detection
    balls.forEach(ball => {
      if (ball.pocketed) return;
      
      pockets.forEach(pocket => {
        const dx = ball.x - pocket.x;
        const dy = ball.y - pocket.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Improved pocket detection - ball must be close enough to pocket center
        const ballRadius = ball.radius || 12;
        const pocketThreshold = pocket.radius - ballRadius + 5; // Slightly more forgiving
        
        if (distance < pocketThreshold) {
          // Double-check ball is actually going toward the pocket (not just passing by)
          const velocityMagnitude = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          
          // Only pocket if ball is moving slowly enough or heading toward pocket
          if (velocityMagnitude < 3 || distance < pocketThreshold - 3) {
            ball.pocketed = true;
            ball.vx = 0;
            ball.vy = 0;
            
            // Add visual feedback for pocketed ball
            console.log(`🎱 Ball ${ball.number || 'cue'} successfully pocketed! Distance: ${distance.toFixed(1)}px`);
            
            // Create a brief flash effect at pocket location
            const flashEffect = document.createElement('div');
            flashEffect.style.position = 'absolute';
            flashEffect.style.left = `${pocket.x - 15}px`;
            flashEffect.style.top = `${pocket.y - 15}px`;
            flashEffect.style.width = '30px';
            flashEffect.style.height = '30px';
            flashEffect.style.background = 'radial-gradient(circle, rgba(255,255,0,0.8) 0%, rgba(255,255,0,0) 70%)';
            flashEffect.style.borderRadius = '50%';
            flashEffect.style.pointerEvents = 'none';
            flashEffect.style.zIndex = '1000';
            flashEffect.style.animation = 'flash 0.5s ease-out';
            
            // Add flash animation CSS if not exists
            if (!document.querySelector('#flashAnimation')) {
              const style = document.createElement('style');
              style.id = 'flashAnimation';
              style.textContent = `
                @keyframes flash {
                  0% { opacity: 1; transform: scale(0.5); }
                  50% { opacity: 1; transform: scale(1.2); }
                  100% { opacity: 0; transform: scale(0.8); }
                }
              `;
              document.head.appendChild(style);
            }
            
            // Find game canvas and add flash effect
            const gameArea = document.querySelector('.pool-game-area');
            if (gameArea) {
              gameArea.style.position = 'relative';
              gameArea.appendChild(flashEffect);
              setTimeout(() => flashEffect.remove(), 500);
            }
            
            handleBallPocketed(ball);
          }
        }
      });
    });
    
    // Update game state
    setCurrentGameData(prev => ({
      ...prev,
      poolBalls: balls,
      ballsInMotion: ballsMoving
    }));
    
    // End physics simulation when all balls stop
    if (!ballsMoving) {
      setCurrentGameData(prev => ({
        ...prev,
        gamePhase: 'aiming',
        physicsRunning: false,
        showCue: true
      }));
    }
    
    return ballsMoving;
  };

  // Handle ball pocketed
  const handleBallPocketed = (ball) => {
    console.log(`🎱 Ball pocketed: ${ball.number || 'cue'} (${ball.type})`);
    const newPocketedBalls = [...(currentGameData.pocketedBalls || []), ball];
    
    if (ball.type === 'cue') {
      // Cue ball pocketed - scratch
      setCurrentGameData(prev => ({
        ...prev,
        gamePhase: 'aiming',
        score: Math.max(0, prev.score - 5),
        pocketedBalls: newPocketedBalls
      }));
      return;
    }
    
    if (ball.type === '8ball') {
      // 8-ball pocketed
      const playerBallsRemaining = currentGameData.poolBalls?.filter(
        b => b.type === currentGameData.playerGroup && !b.pocketed
      ).length || 0;
      
      if (playerBallsRemaining === 0) {
        // Player wins!
        setCurrentGameData(prev => ({
          ...prev,
          gameWon: true,
          winner: 'player',
          gamePhase: 'game_over',
          score: prev.score + 50
        }));
        setTimeout(() => {
          completeGame(currentGameData.score + 50);
        }, 2000);
      } else {
        // Player loses (8-ball too early)
        setCurrentGameData(prev => ({
          ...prev,
          gameWon: true,
          winner: 'ai',
          gamePhase: 'game_over'
        }));
        setTimeout(() => {
          completeGame(0);
        }, 2000);
      }
      return;
    }
    
    // Regular ball pocketed
    if (!currentGameData.playerGroup) {
      // First ball determines player's group
      setCurrentGameData(prev => ({
        ...prev,
        playerGroup: ball.type,
        aiGroup: ball.type === 'solid' ? 'stripe' : 'solid',
        pocketedBalls: newPocketedBalls,
        score: prev.score + 10
      }));
    } else if (ball.type === currentGameData.playerGroup) {
      // Player pocketed their ball
      setCurrentGameData(prev => ({
        ...prev,
        pocketedBalls: newPocketedBalls,
        score: prev.score + 10
      }));
    } else {
      // Player pocketed opponent's ball - foul
      setCurrentGameData(prev => ({
        ...prev,
        score: Math.max(0, prev.score - 3),
        pocketedBalls: newPocketedBalls
      }));
    }
  };

  // Pool Game Controls with Fixed Close-Range Aiming
  const handlePoolMouseMove = (event) => {
    if (currentGameData.gamePhase !== 'aiming') return;
    
    const rect = event.target.getBoundingClientRect();
    const scaleX = currentGameData.tableWidth / rect.width;
    const scaleY = currentGameData.tableHeight / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    
    const cueBall = currentGameData.poolBalls?.[0];
    if (!cueBall || cueBall.pocketed) return;
    
    const dx = mouseX - cueBall.x;
    const dy = mouseY - cueBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Allow aiming even when close to the ball, but with minimum distance of 15
    if (distance > 15) {
      const rawAngle = Math.atan2(dy, dx);
      
      // Reduce sensitivity even more for close-range precision
      const baseSensitivity = 0.4;
      const closeSensitivity = 0.15; // Very slow when close to ball
      const sensitivity = distance < 40 ? closeSensitivity : baseSensitivity;
      
      const currentAngle = currentGameData.aimAngle || 0;
      
      // Smooth angle transition to reduce jerkiness
      let angleDifference = rawAngle - currentAngle;
      
      // Handle angle wrapping around π/-π
      if (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
      if (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
      
      const smoothedAngle = currentAngle + (angleDifference * sensitivity);
      const cueDistance = Math.max(60, distance + 20); // Dynamic cue distance
      
      setCurrentGameData(prev => ({
        ...prev,
        aimAngle: smoothedAngle,
        mousePos: { x: mouseX, y: mouseY },
        cuePosition: {
          x: cueBall.x - Math.cos(smoothedAngle) * cueDistance,
          y: cueBall.y - Math.sin(smoothedAngle) * cueDistance
        }
      }));
    }
  };

  const handlePoolMouseDown = (event) => {
    event.preventDefault();
    if (currentGameData.gamePhase === 'aiming') {
      setCurrentGameData(prev => ({
        ...prev,
        gamePhase: 'charging',
        power: 0,
        chargingStartTime: Date.now()
      }));
    }
  };

  const handlePoolMouseUp = (event) => {
    event.preventDefault();
    if (currentGameData.gamePhase === 'charging') {
      shootCueBall();
    }
  };

  // Improved shoot cue ball function with better power scaling
  const shootCueBall = () => {
    const power = Math.min(currentGameData.power, currentGameData.maxPower);
    const angle = currentGameData.aimAngle;
    
    // Improved power scaling for better control
    const minForce = 3;  // Minimum force for gentle shots
    const maxForce = 25; // Maximum force for power shots
    const force = minForce + (power / 100) * (maxForce - minForce);
    
    const balls = [...currentGameData.poolBalls];
    if (balls[0] && !balls[0].pocketed) {
      balls[0].vx = Math.cos(angle) * force;
      balls[0].vy = Math.sin(angle) * force;
    }
    
    setCurrentGameData(prev => ({
      ...prev,
      poolBalls: balls,
      gamePhase: 'ball_moving',
      ballsInMotion: true,
      power: 0,
      showCue: false,
      physicsRunning: true,
      shotCount: prev.shotCount + 1,
      chargingStartTime: null
    }));
  };

  // Enhanced power control with smoother animation
  useEffect(() => {
    let powerInterval;
    
    if (currentGameData.gamePhase === 'charging') {
      powerInterval = setInterval(() => {
        setCurrentGameData(prev => {
          const chargingTime = Date.now() - (prev.chargingStartTime || Date.now());
          const chargeRate = 1.5; // Slower, more controlled charging
          const newPower = Math.min(prev.power + chargeRate, prev.maxPower);
          
          return {
            ...prev,
            power: newPower,
            powerPulse: Math.sin(chargingTime * 0.01) * 0.1 + 0.9 // Pulsing effect
          };
        });
      }, 25); // Smoother 40 FPS updates
    }
    
    return () => {
      if (powerInterval) {
        clearInterval(powerInterval);
      }
    };
  }, [currentGameData.gamePhase, currentGameData.chargingStartTime]);

  // Chess Game Logic
  const initializeChessGame = () => {
    const initialBoard = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    
    setCurrentGameData(prev => ({
      ...prev,
      chessBoard: initialBoard,
      currentTurn: 'white',
      selectedSquare: null,
      validMoves: [],
      gamePhase: 'playing',
      capturedPieces: { white: [], black: [] },
      moveHistory: [],
      inCheck: false
    }));
  };

  // KBC Quiz Game Logic - Complete Implementation
  const initializeKBCQuiz = () => {
    const kbcQuestions = [
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        correct: 1,
        amount: 1000
      },
      {
        question: "Who wrote the Indian National Anthem?",
        options: ["Mahatma Gandhi", "Rabindranath Tagore", "Subhash Chandra Bose", "Jawaharlal Nehru"],
        correct: 1,
        amount: 2000
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        correct: 2,
        amount: 3000
      },
      {
        question: "What is the largest mammal in the world?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correct: 1,
        amount: 5000
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2,
        amount: 10000
      }
    ];

    setCurrentGameData(prev => ({
      ...prev,
      kbc: {
        questions: kbcQuestions,
        currentQuestion: 0,
        selectedAnswer: null,
        finalAnswer: false,
        timer: 30,
        winnings: 0,
        gamePhase: 'question', // question, lifeline, final_answer, result
        lifelines: {
          fiftyFifty: true,
          audiencePoll: true,
          phoneAFriend: true
        },
        eliminated: false
      },
      gameStarted: true,
      gamePhase: 'playing'
    }));
  };

  // Car Racing Game Logic
  const initializeRacingGame = () => {
    const track = {
      width: 400,
      height: 600,
      lanes: 3
    };
    
    const obstacles = [
      { x: 100, y: -100, width: 40, height: 60, speed: 3 },
      { x: 200, y: -200, width: 40, height: 60, speed: 4 },
      { x: 300, y: -300, width: 40, height: 60, speed: 2 }
    ];
    
    setCurrentGameData(prev => ({
      ...prev,
      playerCar: { x: 200, y: 500, lane: 1, speed: 0 },
      obstacles: obstacles,
      gamePhase: 'racing',
      distance: 0,
      fuel: 100,
      speed: 0,
      coins: 0,
      powerUps: []
    }));
  };

  // Archery Game Logic
  const initializeArcheryGame = () => {
    setCurrentGameData(prev => ({
      ...prev,
      archery: {
        // Tournament Settings
        tournament: {
          level: 1, // 1=Easy, 2=Medium, 3=Hard, 4=Expert
          round: 1,
          totalRounds: 6,
          currentSet: 1,
          totalSets: 3
        },
        
        // Professional Target System
        target: { 
          x: 450, y: 200, 
          distance: 50, // meters
          moving: false,
          moveSpeed: 0,
          movePattern: 'static',
          rings: [
            { radius: 15, points: 10, color: '#FFD700', name: 'X' }, // Gold X-ring
            { radius: 25, points: 10, color: '#FFD700', name: '10' }, // Gold 10
            { radius: 35, points: 9, color: '#FFD700', name: '9' },   // Gold 9
            { radius: 45, points: 8, color: '#FF0000', name: '8' },   // Red 8
            { radius: 55, points: 7, color: '#FF0000', name: '7' },   // Red 7
            { radius: 65, points: 6, color: '#0080FF', name: '6' },   // Blue 6
            { radius: 75, points: 5, color: '#0080FF', name: '5' },   // Blue 5
            { radius: 85, points: 4, color: '#000000', name: '4' },   // Black 4
            { radius: 95, points: 3, color: '#000000', name: '3' },   // Black 3
            { radius: 105, points: 2, color: '#FFFFFF', name: '2' },  // White 2
            { radius: 115, points: 1, color: '#FFFFFF', name: '1' }   // White 1
          ]
        },
        
        // Professional Bow System
        bow: { 
          x: 80, y: 200, 
          type: 'recurve', // recurve, compound, longbow
          drawWeight: 40, // pounds
          stabilizer: true,
          sight: true,
          drawn: false, 
          power: 0, 
          angle: 0,
          steadiness: 100 // affects accuracy
        },
        
        // Advanced Arrow Physics
        arrow: { 
          x: 0, y: 0, vx: 0, vy: 0, 
          flying: false, 
          trail: [],
          weight: 'medium', // light, medium, heavy
          fletching: 'standard', // standard, spin-wing, feather
          point: 'field' // field, target, broadhead
        },
        
        // Environmental Conditions
        environment: {
          wind: { 
            speed: Math.random() * 8 - 4, // -4 to +4 m/s
            direction: Math.random() * 360, // degrees
            gusts: Math.random() > 0.7,
            gustStrength: 0
          },
          temperature: 20 + Math.random() * 10, // 20-30°C
          humidity: 40 + Math.random() * 30, // 40-70%
          pressure: 1013 + Math.random() * 20 - 10, // atmospheric
          lighting: 'perfect' // perfect, dim, bright, variable
        },
        
        // Scoring System
        scoring: {
          arrows: [],
          shotsRemaining: 6,
          totalScore: 0,
          currentEnd: 1,
          endScore: 0,
          bestEnd: 0,
          consistency: 0,
          accuracy: 0
        },
        
        // Difficulty Modifiers
        difficulty: {
          targetSize: 1.0, // multiplier
          windEffect: 1.0,
          distanceVariation: false,
          movingTarget: false,
          timeLimit: false,
          pressureRounds: false
        },
        
        // Game State
        gamePhase: 'aiming', // aiming, drawing, shooting, scoring, levelUp
        notifications: [],
        achievements: [],
        equipment: {
          unlockedBows: ['recurve'],
          unlockedArrows: ['standard'],
          upgrades: {}
        }
      },
      gameStarted: true,
      gamePhase: 'playing'
    }));
    
    // Set difficulty based on level
    updateArcheryDifficulty(1);
  };

  // Dynamic Difficulty System
  const updateArcheryDifficulty = (level) => {
    setCurrentGameData(prev => {
      const difficulty = { ...prev.archery.difficulty };
      const environment = { ...prev.archery.environment };
      const target = { ...prev.archery.target };
      
      switch(level) {
        case 1: // Easy - Training
          difficulty.targetSize = 1.2;
          difficulty.windEffect = 0.5;
          environment.wind.speed *= 0.5;
          target.distance = 30;
          target.moving = false;
          break;
          
        case 2: // Medium - Club Championship
          difficulty.targetSize = 1.0;
          difficulty.windEffect = 0.8;
          target.distance = 50;
          target.moving = false;
          break;
          
        case 3: // Hard - National Tournament
          difficulty.targetSize = 0.9;
          difficulty.windEffect = 1.2;
          target.distance = 70;
          target.moving = true;
          target.moveSpeed = 1;
          target.movePattern = 'pendulum';
          break;
          
        case 4: // Expert - Olympic Level
          difficulty.targetSize = 0.8;
          difficulty.windEffect = 1.5;
          target.distance = 90;
          target.moving = true;
          target.moveSpeed = 2;
          target.movePattern = 'figure8';
          difficulty.timeLimit = true;
          break;
      }
      
      return {
        ...prev,
        archery: {
          ...prev.archery,
          difficulty,
          environment,
          target,
          tournament: { ...prev.archery.tournament, level }
        }
      };
    });
  };

  // Professional Archery Controls with Realistic Physics
  const handleArcheryMouseMove = (event) => {
    if (currentGameData.archery?.gamePhase !== 'aiming') return;
    
    const rect = event.target.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (600 / rect.width);
    const mouseY = (event.clientY - rect.top) * (400 / rect.height);
    
    const bow = currentGameData.archery.bow;
    const dx = mouseX - bow.x;
    const dy = mouseY - bow.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Simulate bow steadiness based on distance and movement
    const steadinessLoss = Math.min(distance / 10, 20);
    const newSteadiness = Math.max(80, 100 - steadinessLoss);
    
    setCurrentGameData(prev => ({
      ...prev,
      archery: {
        ...prev.archery,
        bow: { 
          ...prev.archery.bow, 
          angle: angle,
          steadiness: newSteadiness
        }
      }
    }));
  };

  const handleArcheryMouseDown = (event) => {
    event.preventDefault();
    if (currentGameData.archery?.gamePhase === 'aiming' && currentGameData.archery?.scoring?.shotsRemaining > 0) {
      setCurrentGameData(prev => ({
        ...prev,
        archery: {
          ...prev.archery,
          gamePhase: 'drawing',
          bow: { 
            ...prev.archery.bow, 
            drawn: true, 
            power: 0,
            chargingStartTime: Date.now()
          }
        }
      }));
    }
  };

  const handleArcheryMouseUp = (event) => {
    event.preventDefault();
    if (currentGameData.archery?.gamePhase === 'drawing' && currentGameData.archery?.bow.drawn) {
      shootProfessionalArrow();
    }
  };

  const shootProfessionalArrow = () => {
    const { bow, environment, target, difficulty } = currentGameData.archery;
    const power = Math.min(bow.power, 100);
    
    // Calculate base velocity with bow characteristics
    let velocity = (power / 100) * 15;
    if (bow.type === 'compound') velocity *= 1.2;
    if (bow.type === 'longbow') velocity *= 0.9;
    
    // Apply environmental effects
    const windEffect = environment.wind.speed * difficulty.windEffect;
    const windAngle = environment.wind.direction * (Math.PI / 180);
    
    // Calculate final trajectory
    const baseAngle = bow.angle;
    const finalVx = Math.cos(baseAngle) * velocity + Math.cos(windAngle) * windEffect * 0.05;
    const finalVy = Math.sin(baseAngle) * velocity + Math.sin(windAngle) * windEffect * 0.05;
    
    // Add accuracy variation based on steadiness
    const steadinessEffect = (bow.steadiness / 100);
    const accuracy = steadinessEffect * 0.95 + 0.05;
    const spread = (1 - accuracy) * 5;
    
    setCurrentGameData(prev => ({
      ...prev,
      archery: {
        ...prev.archery,
        arrow: {
          x: bow.x + 20,
          y: bow.y,
          vx: finalVx + (Math.random() - 0.5) * spread,
          vy: finalVy + (Math.random() - 0.5) * spread,
          flying: true,
          trail: [{x: bow.x + 20, y: bow.y}]
        },
        gamePhase: 'shooting',
        bow: { ...prev.archery.bow, drawn: false, power: 0, steadiness: 100 }
      }
    }));
  };

  // Professional Arrow Physics Update (like 8 Ball Pool)
  const updateArcheryPhysics = () => {
    if (!currentGameData.archery?.arrow.flying) return;

    setCurrentGameData(prev => {
      const arrow = prev.archery.arrow;
      const target = prev.archery.target;
      
      // Update position
      const newX = arrow.x + arrow.vx;
      const newY = arrow.y + arrow.vy;
      
      // Apply gravity
      const newVy = arrow.vy + 0.3;
      
      // Update trail
      const newTrail = [...arrow.trail, {x: newX, y: newY}].slice(-8);
      
      // Check target collision
      const targetDistance = Math.sqrt(
        Math.pow(newX - target.x, 2) + Math.pow(newY - target.y, 2)
      );
      
      // Check if arrow hit target
      let hitRing = null;
      for (let i = 0; i < target.rings.length; i++) {
        const ring = target.rings[i];
        const adjustedRadius = ring.radius * (prev.archery.difficulty?.targetSize || 1);
        if (targetDistance <= adjustedRadius) {
          hitRing = ring;
          break;
        }
      }
      
      // Check bounds (arrow went off screen)
      const outOfBounds = newX < 0 || newX > 650 || newY < 0 || newY > 350;
      
      if (hitRing || outOfBounds) {
        // Arrow hit target or went out of bounds
        const points = hitRing ? hitRing.points : 0;
        const newScore = prev.archery.scoring.totalScore + points;
        const newShotsRemaining = prev.archery.scoring.shotsRemaining - 1;
        
        // Award coins for good shots
        if (points >= 8) {
          setTimeout(() => {
            updateCoins(points, 'game_reward');
            setCoinsEarned(points);
            setShowCoinAnimation(true);
            setTimeout(() => setShowCoinAnimation(false), 2000);
          }, 500);
        }
        
        return {
          ...prev,
          archery: {
            ...prev.archery,
            arrow: { ...arrow, flying: false, x: newX, y: newY, trail: newTrail },
            scoring: {
              ...prev.archery.scoring,
              totalScore: newScore,
              shotsRemaining: newShotsRemaining,
              arrows: [...prev.archery.scoring.arrows, {
                x: newX, y: newY, points: points, ring: hitRing?.name || 'Miss'
              }]
            },
            gamePhase: newShotsRemaining <= 0 ? 'completed' : 'aiming'
          }
        };
      }
      
      return {
        ...prev,
        archery: {
          ...prev.archery,
          arrow: {
            ...arrow,
            x: newX,
            y: newY,
            vy: newVy,
            trail: newTrail
          }
        }
      };
    });
  };

  // Rummy Game Logic
  const initializeRummyGame = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [];
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({ suit, rank, value: rank === 'A' ? 1 : (rank === 'J' || rank === 'Q' || rank === 'K' ? 10 : parseInt(rank)) });
      });
    });
    
    // Shuffle deck
    deck = deck.sort(() => Math.random() - 0.5);
    
    const playerHand = deck.splice(0, 13);
    const aiHand = deck.splice(0, 13);
    const discardPile = [deck.pop()];
    
    setCurrentGameData(prev => ({
      ...prev,
      deck: deck,
      playerHand: playerHand,
      aiHand: aiHand,
      discardPile: discardPile,
      selectedCards: [],
      gamePhase: 'playing',
      currentTurn: 'player',
      melds: { player: [], ai: [] }
    }));
  };

  // FPS Shooter Game Logic
  const initializeFPSGame = () => {
    setCurrentGameData(prev => ({
      ...prev,
      fps: {
        crosshair: { x: 200, y: 200, size: 20 },
        targets: Array.from({length: 5}, (_, i) => ({
          id: i,
          x: Math.random() * 300 + 100,
          y: Math.random() * 200 + 100,
          size: Math.random() * 30 + 20,
          speed: Math.random() * 2 + 1,
          direction: Math.random() * 360,
          hit: false,
          points: Math.floor(Math.random() * 50) + 10
        })),
        ammo: 20,
        totalShots: 0,
        hits: 0,
        gamePhase: 'shooting', // shooting, reloading, finished
        reloadTime: 0,
        scope: { zoom: 1, sway: 0 },
        accuracy: 100
      },
      gameStarted: true,
      gamePhase: 'playing'
    }));
  };

  // City Builder Game Logic - Complete Implementation
  const initializeCityBuilder = () => {
    setCurrentGameData(prev => ({
      ...prev,
      cityBuilder: {
        grid: Array(10).fill(null).map(() => Array(10).fill(null)),
        resources: {
          money: 10000,
          population: 0,
          happiness: 50,
          power: 0,
          water: 0
        },
        buildings: {
          house: { cost: 500, population: 4, happiness: 1 },
          shop: { cost: 1000, population: 0, happiness: 2, income: 100 },
          factory: { cost: 2000, population: 0, happiness: -1, income: 300 },
          park: { cost: 800, population: 0, happiness: 3 },
          powerPlant: { cost: 3000, power: 20, happiness: -2 },
          waterTower: { cost: 1500, water: 15, happiness: 1 }
        },
        selectedBuilding: 'house',
        gamePhase: 'building', // building, planning, finished
        objectives: [
          { description: "Reach 100 population", target: 100, current: 0, completed: false },
          { description: "Maintain 70% happiness", target: 70, current: 50, completed: false },
          { description: "Generate 1000 income", target: 1000, current: 0, completed: false }
        ],
        income: 0,
        day: 1
      },
      gameStarted: true,
      gamePhase: 'playing'
    }));
  };

  // Reaction Test Game Logic
  const initializeReactionTest = () => {
    setCurrentGameData(prev => ({
      ...prev,
      gamePhase: 'waiting', // waiting, ready, react, result
      reactionTimes: [],
      currentRound: 0,
      totalRounds: 5,
      averageTime: 0,
      bestTime: 0,
      stimulus: null,
      stimulusTime: 0
    }));
    
    setTimeout(() => {
      startReactionRound();
    }, 1000);
  };

  // Typing Speed Test Logic
  const initializeTypingTest = () => {
    const sampleTexts = [
      "The quick brown fox jumps over the lazy dog.",
      "Programming is the art of telling another human being what one wants the computer to do.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "Innovation distinguishes between a leader and a follower.",
      "The only way to do great work is to love what you do."
    ];
    
    const selectedText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    
    setCurrentGameData(prev => ({
      ...prev,
      targetText: selectedText,
      typedText: '',
      gamePhase: 'typing',
      startTime: Date.now(),
      errors: 0,
      wpm: 0,
      accuracy: 100
    }));
  };

  // Math Game Logic (Enhanced)
  const initializeMathGame = () => {
    generateMathQuestion();
  };

  // Memory Game Logic
  const initializeMemoryGame = () => {
    const sequence = [];
    for(let i = 0; i < 3; i++) {
      sequence.push(Math.floor(Math.random() * 4)); // 0-3 for 4 colors
    }
    
    setCurrentGameData(prev => ({
      ...prev,
      memorySequence: sequence,
      userSequence: [],
      showingSequence: true,
      gamePhase: 'showing',
      currentStep: 0,
      level: 1,
      sequenceSpeed: 1000
    }));
    
    showMemorySequence(sequence);
  };

  // Lucky Wheel Logic
  const initializeLuckyWheel = () => {
    const wheelSegments = [
      { label: '5 Coins', value: 5, color: '#FF6B6B' },
      { label: '10 Coins', value: 10, color: '#4ECDC4' },
      { label: '15 Coins', value: 15, color: '#45B7D1' },
      { label: '20 Coins', value: 20, color: '#96CEB4' },
      { label: '25 Coins', value: 25, color: '#FFEAA7' },
      { label: '50 Coins', value: 50, color: '#DDA0DD' },
      { label: 'Try Again', value: 0, color: '#FF7675' },
      { label: '100 Coins', value: 100, color: '#00B894' }
    ];
    
    setCurrentGameData(prev => ({
      ...prev,
      wheelSegments: wheelSegments,
      spinning: false,
      rotation: 0,
      result: null,
      gamePhase: 'ready'
    }));
  };

  // Scratch Card Logic
  const initializeScratchCard = () => {
    const prizes = [5, 10, 15, 20, 25, 50, 100];
    const winningPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    setCurrentGameData(prev => ({
      ...prev,
      scratchCard: {
        width: 300,
        height: 200,
        scratchedAreas: [],
        prize: winningPrize,
        revealed: false
      },
      gamePhase: 'scratching',
      scratchPercentage: 0
    }));
  };

  // Enhanced Math game with progressive difficulty
  const generateMathProblem = () => {
    const level = Math.min(Math.floor(currentGameData.score / 5) + 1, 10);
    const difficulty = Math.min(level * 10, 100);
    
    let num1, num2, operator, answer, question;
    
    if (level <= 2) {
      // Easy addition/subtraction
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '+') {
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
      } else {
        answer = Math.abs(num1 - num2);
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
      }
    } else if (level <= 5) {
      // Medium with multiplication
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      const ops = ['+', '-', '*'];
      operator = ops[Math.floor(Math.random() * ops.length)];
      
      switch(operator) {
        case '+':
          answer = num1 + num2;
          question = `${num1} + ${num2} = ?`;
          break;
        case '-':
          answer = Math.abs(num1 - num2);
          question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
          break;
        case '*':
          answer = num1 * num2;
          question = `${num1} × ${num2} = ?`;
          break;
      }
    } else {
      // Hard with division and complex operations
      const complexOps = [
        () => {
          const a = Math.floor(Math.random() * 20) + 10;
          const b = Math.floor(Math.random() * 10) + 2;
          return { question: `√${a * a} + ${b} = ?`, answer: a + b };
        },
        () => {
          const a = Math.floor(Math.random() * 15) + 5;
          const b = Math.floor(Math.random() * 5) + 2;
          return { question: `${a * b} ÷ ${b} = ?`, answer: a };
        },
        () => {
          const a = Math.floor(Math.random() * 10) + 2;
          const b = Math.floor(Math.random() * 10) + 2;
          const c = Math.floor(Math.random() * 10) + 2;
          return { question: `${a} × ${b} + ${c} = ?`, answer: a * b + c };
        }
      ];
      const complex = complexOps[Math.floor(Math.random() * complexOps.length)]();
      question = complex.question;
      answer = complex.answer;
    }
    
    setCurrentGameData(prev => ({
      ...prev,
      question,
      correctAnswer: answer,
      userAnswer: '',
      level
    }));
  };

  // Enhanced Memory game with increasing sequence length
  const startMemoryGame = () => {
    const sequenceLength = Math.min(3 + Math.floor(currentGameData.score / 3), 12);
    const sequence = Array.from({length: sequenceLength}, () => Math.floor(Math.random() * 9) + 1);
    
    setCurrentGameData(prev => ({
      ...prev,
      sequence,
      userSequence: [],
      showSequence: true,
      question: `Memorize this sequence: ${sequence.join(' - ')}`,
      correctAnswer: sequence.join('')
    }));
    
    // Hide sequence after showing time
    setTimeout(() => {
      setCurrentGameData(prev => ({
        ...prev,
        showSequence: false,
        question: 'Enter the sequence you saw:'
      }));
    }, sequenceLength * 1000 + 2000);
  };

  // Enhanced Word Puzzle with themed categories
  const generateWordPuzzle = () => {
    const categories = {
      tech: ['JAVASCRIPT', 'REACT', 'CODING', 'ALGORITHM', 'DATABASE', 'FRONTEND', 'BACKEND', 'API'],
      animals: ['ELEPHANT', 'DOLPHIN', 'BUTTERFLY', 'CHEETAH', 'PENGUIN', 'KANGAROO', 'OCTOPUS'],
      countries: ['AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT', 'FRANCE', 'GERMANY'],
      food: ['CHOCOLATE', 'SANDWICH', 'HAMBURGER', 'SPAGHETTI', 'STRAWBERRY', 'PINEAPPLE']
    };
    
    const categoryNames = Object.keys(categories);
    const selectedCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const words = categories[selectedCategory];
    const word = words[Math.floor(Math.random() * words.length)];
    const shuffled = word.split('').sort(() => Math.random() - 0.5).join('');
    
    setCurrentGameData(prev => ({
      ...prev,
      question: `Unscramble this ${selectedCategory.toUpperCase()} word: ${shuffled}`,
      correctAnswer: word,
      userAnswer: ''
    }));
  };

  // New Logic Grid Game
  const generateLogicPuzzle = () => {
    const puzzles = [
      {
        question: "If A = 1, B = 2, C = 3... What is the sum of CAB?",
        answer: 6, // C(3) + A(1) + B(2) = 6
        hint: "Convert letters to numbers"
      },
      {
        question: "Complete the pattern: 2, 4, 8, 16, ?",
        answer: 32,
        hint: "Each number doubles"
      },
      {
        question: "If 3 cats catch 3 rats in 3 minutes, how many cats catch 100 rats in 100 minutes?",
        answer: 3,
        hint: "Think about the rate"
      },
      {
        question: "What comes next: 1, 1, 2, 3, 5, 8, ?",
        answer: 13,
        hint: "Fibonacci sequence"
      }
    ];
    
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    setCurrentGameData(prev => ({
      ...prev,
      question: puzzle.question,
      correctAnswer: puzzle.answer,
      userAnswer: '',
      hint: puzzle.hint
    }));
  };

  // Enhanced Reaction Test
  const startReactionTest = () => {
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    setCurrentGameData(prev => ({
      ...prev,
      question: 'Wait for GREEN... Get ready!',
      canClick: false,
      reactionStartTime: null
    }));
    
    setTimeout(() => {
      setCurrentGameData(prev => ({
        ...prev,
        question: 'CLICK NOW! 🟢',
        canClick: true,
        reactionStartTime: Date.now()
      }));
    }, delay);
  };

  // Enhanced Typing Speed Test
  const startTypingTest = () => {
    const sentences = [
      'The quick brown fox jumps over the lazy dog.',
      'Programming is the art of solving complex problems with elegant code.',
      'Practice makes perfect in everything you do consistently.',
      'Speed and accuracy are both important in competitive typing.',
      'JavaScript is a versatile programming language for web development.',
      'React helps developers build interactive user interfaces efficiently.',
      'Algorithms and data structures are fundamental to computer science.',
      'Clean code is easier to read, maintain, and debug effectively.'
    ];
    
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    setCurrentGameData(prev => ({
      ...prev,
      question: sentence,
      correctAnswer: sentence,
      userAnswer: '',
      typingStartTime: Date.now()
    }));
  };

  // Enhanced Color Match with multiple colors
  const generateColorMatch = () => {
    const colors = [
      { name: 'RED', hex: '#FF0000' },
      { name: 'BLUE', hex: '#0000FF' },
      { name: 'GREEN', hex: '#00FF00' },
      { name: 'YELLOW', hex: '#FFFF00' },
      { name: 'PURPLE', hex: '#800080' },
      { name: 'ORANGE', hex: '#FFA500' },
      { name: 'PINK', hex: '#FFC0CB' },
      { name: 'CYAN', hex: '#00FFFF' }
    ];
    
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!shuffledColors.find(c => c.name === targetColor.name)) {
      shuffledColors[0] = targetColor;
    }
    
    setCurrentGameData(prev => ({
      ...prev,
      question: `Click the ${targetColor.name} button!`,
      correctAnswer: targetColor.name,
      colorOptions: shuffledColors,
      userAnswer: ''
    }));
  };

  // New Pattern Match Game
  const generatePatternSequence = () => {
    const patterns = ['🔴', '🟡', '🟢', '🔵', '🟣', '🟠'];
    const length = Math.min(3 + Math.floor(currentGameData.score / 4), 8);
    const sequence = Array.from({length}, () => patterns[Math.floor(Math.random() * patterns.length)]);
    
    setCurrentGameData(prev => ({
      ...prev,
      sequence,
      userSequence: [],
      showSequence: true,
      question: 'Remember this pattern:',
      patternOptions: patterns
    }));
    
    setTimeout(() => {
      setCurrentGameData(prev => ({
        ...prev,
        showSequence: false,
        question: 'Repeat the pattern:'
      }));
    }, length * 800 + 1000);
  };

  // Bubble Pop Game
  const initializeBubbleGame = () => {
    const bubbles = Array.from({length: 15}, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 30 + 20,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      points: Math.floor(Math.random() * 10) + 5,
      popped: false
    }));
    
    setCurrentGameData(prev => ({
      ...prev,
      bubbles,
      question: 'Pop the bubbles to earn points!'
    }));
  };

  // Target Shooter Game
  const initializeTargetGame = () => {
    generateNewTarget();
  };

  const generateNewTarget = () => {
    setCurrentGameData(prev => ({
      ...prev,
      targetPosition: {
        x: Math.random() * 70 + 15,
        y: Math.random() * 70 + 15
      },
      question: 'Click the target!'
    }));
  };

  // Coin Collector Game
  const initializeCoinCollector = () => {
    setCurrentGameData(prev => ({
      ...prev,
      collectables: [],
      playerPosition: { x: 50, y: 80 },
      question: 'Use arrow keys to collect falling coins!'
    }));
    
    // Start dropping coins
    const dropInterval = setInterval(() => {
      if (currentGameData.gameFinished) {
        clearInterval(dropInterval);
        return;
      }
      
      setCurrentGameData(prev => ({
        ...prev,
        collectables: [...prev.collectables, {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: 0,
          points: Math.floor(Math.random() * 15) + 5,
          type: Math.random() > 0.8 ? 'bonus' : 'coin'
        }]
      }));
    }, 1000);
  };

  // Lucky Spin Game
  const initializeLuckySpin = () => {
    const prizes = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
    setCurrentGameData(prev => ({
      ...prev,
      question: 'Click to spin the wheel!',
      wheelPrizes: prizes,
      wheelSpinning: false,
      spinResult: null
    }));
  };

  // Treasure Hunt Game
  const initializeTreasureHunt = () => {
    const treasures = Array.from({length: 12}, (_, i) => ({
      id: i,
      x: (i % 4) * 25 + 12.5,
      y: Math.floor(i / 4) * 30 + 15,
      isTreasure: Math.random() > 0.7,
      isRevealed: false,
      points: Math.random() > 0.5 ? 20 : 10
    }));
    
    setCurrentGameData(prev => ({
      ...prev,
      treasures,
      question: 'Find the hidden treasures!',
      remainingClicks: 5
    }));
  };

  // Duplicate removed - using new initializeScratchCard above

  // Daily Challenge (Combination Game)
  const initializeDailyChallenge = () => {
    const challenges = [
      { type: 'math', count: 5, description: 'Solve 5 math problems' },
      { type: 'memory', count: 3, description: 'Complete 3 memory sequences' },
      { type: 'reaction', count: 10, description: 'React to 10 signals' },
      { type: 'mixed', count: 8, description: 'Complete 8 mixed challenges' }
    ];
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentGameData(prev => ({
      ...prev,
      challenge,
      challengeProgress: 0,
      question: `Daily Challenge: ${challenge.description}`
    }));
  };

  // Enhanced answer submission with streak bonuses and feedback
  const submitAnswer = () => {
    const isCorrect = checkAnswer();
    
    if (isCorrect) {
      const basePoints = getBasePoints();
      const streakBonus = Math.floor(currentGameData.streak * 0.5);
      const levelBonus = Math.floor(currentGameData.level * 2);
      const totalPoints = basePoints + streakBonus + levelBonus;
      
      setCurrentGameData(prev => ({
        ...prev,
        score: prev.score + totalPoints,
        streak: prev.streak + 1,
        combo: prev.combo + 1,
        userAnswer: ''
      }));
      
      // Show success feedback
      showFeedback('Correct! +' + totalPoints, 'success');
      
      // Generate next challenge based on game type
      setTimeout(() => {
        generateNextChallenge();
      }, 500);
      
    } else {
      setCurrentGameData(prev => ({
        ...prev,
        streak: 0,
        combo: 0,
        lives: Math.max(0, prev.lives - 1),
        userAnswer: ''
      }));
      
      showFeedback('Try again!', 'error');
      
      if (currentGameData.lives <= 1) {
        completeGame();
      } else {
        setTimeout(() => generateNextChallenge(), 1000);
      }
    }
  };

  // Game-specific answer checking
  const checkAnswer = () => {
    const userAns = currentGameData.userAnswer.toString().toLowerCase().trim();
    const correctAns = currentGameData.correctAnswer.toString().toLowerCase().trim();
    
    switch(selectedGame?.id) {
      case 'typing_speed':
        const accuracy = calculateTypingAccuracy(userAns, correctAns);
        return accuracy >= 90; // 90% accuracy required
      case 'reaction_test':
        return currentGameData.reactionTime && currentGameData.reactionTime < 1000;
      case 'memory_challenge':
        return currentGameData.userSequence.join('') === currentGameData.sequence.join('');
      case 'pattern_match':
        return JSON.stringify(currentGameData.userSequence) === JSON.stringify(currentGameData.sequence);
      default:
        return userAns === correctAns;
    }
  };

  // Calculate typing accuracy
  const calculateTypingAccuracy = (typed, target) => {
    const typedWords = typed.split(' ');
    const targetWords = target.split(' ');
    let correct = 0;
    
    for (let i = 0; i < Math.min(typedWords.length, targetWords.length); i++) {
      if (typedWords[i] === targetWords[i]) correct++;
    }
    
    return Math.round((correct / targetWords.length) * 100);
  };

  // Get base points for different games
  const getBasePoints = () => {
    const gamePoints = {
      'quick_math': 10,
      'memory_challenge': 15,
      'word_puzzle': 12,
      'logic_grid': 20,
      'reaction_test': 8,
      'typing_speed': 15,
      'color_match': 8,
      'pattern_match': 18,
      'bubble_pop': 5,
      'target_shooter': 10,
      'coin_collector': 12,
      'lucky_spin': 0, // Variable
      'treasure_hunt': 25,
      'scratch_card': 0, // Variable
      'daily_challenge': 30
    };
    return gamePoints[selectedGame?.id] || 10;
  };

  // Generate next challenge based on game type
  const generateNextChallenge = () => {
    switch(selectedGame?.id) {
      case 'quick_math':
        generateMathProblem();
        break;
      case 'memory_challenge':
        startMemoryGame();
        break;
      case 'word_puzzle':
        generateWordPuzzle();
        break;
      case 'logic_grid':
        generateLogicPuzzle();
        break;
      case 'reaction_test':
        startReactionTest();
        break;
      case 'typing_speed':
        startTypingTest();
        break;
      case 'color_match':
        generateColorMatch();
        break;
      case 'pattern_match':
        generatePatternSequence();
        break;
      default:
        break;
    }
  };

  // Game-specific interaction handlers
  const handleGameClick = (x, y, target) => {
    switch(selectedGame?.id) {
      case 'reaction_test':
        if (currentGameData.canClick && currentGameData.reactionStartTime) {
          const reactionTime = Date.now() - currentGameData.reactionStartTime;
          const points = Math.max(50 - Math.floor(reactionTime / 10), 5);
          
          setCurrentGameData(prev => ({
            ...prev,
            score: prev.score + points,
            reactionTime
          }));
          
          showFeedback(`${reactionTime}ms! +${points}`, 'success');
          
          setTimeout(() => {
            startReactionTest();
          }, 1500);
        }
        break;
        
      case 'bubble_pop':
        const bubble = currentGameData.bubbles.find(b => 
          !b.popped && 
          Math.abs(b.x - x) < b.size/2 && 
          Math.abs(b.y - y) < b.size/2
        );
        
        if (bubble) {
          setCurrentGameData(prev => ({
            ...prev,
            score: prev.score + bubble.points,
            bubbles: prev.bubbles.map(b => 
              b.id === bubble.id ? {...b, popped: true} : b
            )
          }));
          
          showFeedback(`+${bubble.points}`, 'success');
        }
        break;
        
      case 'target_shooter':
        const distance = Math.sqrt(
          Math.pow(currentGameData.targetPosition.x - x, 2) + 
          Math.pow(currentGameData.targetPosition.y - y, 2)
        );
        
        if (distance < 10) {
          const points = Math.max(20 - Math.floor(distance), 5);
          setCurrentGameData(prev => ({
            ...prev,
            score: prev.score + points
          }));
          
          showFeedback(`Bullseye! +${points}`, 'success');
          generateNewTarget();
        }
        break;
        
      case 'color_match':
        const clickedColor = target;
        if (clickedColor === currentGameData.correctAnswer) {
          setCurrentGameData(prev => ({
            ...prev,
            score: prev.score + 10,
            streak: prev.streak + 1
          }));
          
          showFeedback('Correct! +10', 'success');
          setTimeout(() => generateColorMatch(), 800);
        }
        break;
        
      case 'treasure_hunt':
        if (currentGameData.remainingClicks > 0) {
          const clickedTreasure = currentGameData.treasures.find(t => 
            !t.isRevealed && 
            Math.abs(t.x - x) < 12 && 
            Math.abs(t.y - y) < 12
          );
          
          if (clickedTreasure) {
            setCurrentGameData(prev => ({
              ...prev,
              remainingClicks: prev.remainingClicks - 1,
              treasures: prev.treasures.map(t => 
                t.id === clickedTreasure.id ? {...t, isRevealed: true} : t
              ),
              score: prev.score + (clickedTreasure.isTreasure ? clickedTreasure.points : 0)
            }));
            
            if (clickedTreasure.isTreasure) {
              showFeedback(`Treasure! +${clickedTreasure.points}`, 'success');
            } else {
              showFeedback('Empty...', 'neutral');
            }
          }
        }
        break;
        
      case 'scratch_card':
        const scratchArea = currentGameData.scratchAreas.find(s => 
          !s.isScratched && 
          Math.abs(s.x - x) < 15 && 
          Math.abs(s.y - y) < 15
        );
        
        if (scratchArea) {
          setCurrentGameData(prev => ({
            ...prev,
            scratchAreas: prev.scratchAreas.map(s => 
              s.id === scratchArea.id ? {...s, isScratched: true} : s
            ),
            score: prev.score + scratchArea.prize
          }));
          
          if (scratchArea.prize > 0) {
            showFeedback(`Prize! +${scratchArea.prize}`, 'success');
          }
        }
        break;
        
      case 'lucky_spin':
        if (!currentGameData.wheelSpinning) {
          setCurrentGameData(prev => ({
            ...prev,
            wheelSpinning: true
          }));
          
          setTimeout(() => {
            const prizes = currentGameData.wheelPrizes;
            const prize = prizes[Math.floor(Math.random() * prizes.length)];
            
            setCurrentGameData(prev => ({
              ...prev,
              wheelSpinning: false,
              spinResult: prize,
              score: prev.score + prize
            }));
            
            showFeedback(`You won ${prize} coins!`, 'success');
          }, 2000);
        }
        break;
    }
  };

  // Pattern matching handler
  const handlePatternClick = (pattern) => {
    if (currentGameData.showSequence) return;
    
    const newUserSequence = [...currentGameData.userSequence, pattern];
    
    setCurrentGameData(prev => ({
      ...prev,
      userSequence: newUserSequence
    }));
    
    if (newUserSequence.length === currentGameData.sequence.length) {
      setTimeout(() => {
        if (JSON.stringify(newUserSequence) === JSON.stringify(currentGameData.sequence)) {
          const points = currentGameData.sequence.length * 5;
          setCurrentGameData(prev => ({
            ...prev,
            score: prev.score + points,
            userSequence: []
          }));
          
          showFeedback(`Perfect! +${points}`, 'success');
          setTimeout(() => generatePatternSequence(), 1000);
        } else {
          showFeedback('Wrong pattern!', 'error');
          setCurrentGameData(prev => ({
            ...prev,
            userSequence: [],
            lives: Math.max(0, prev.lives - 1)
          }));
          
          if (currentGameData.lives <= 1) {
            completeGame();
          } else {
            setTimeout(() => generatePatternSequence(), 1500);
          }
        }
      }, 500);
    }
  };

  // Complete game and award coins
  const completeGame = (finalScore = currentGameData.score) => {
    setCurrentGameData(prev => ({
      ...prev,
      gameFinished: true,
      gameStarted: false
    }));
    
    // Calculate coin reward based on score
    const baseReward = getBaseReward(selectedGame?.id || 'quick_math');
    const bonusMultiplier = Math.min(finalScore / 10, 3); // Max 3x bonus
    const coinsEarned = Math.floor(baseReward + (baseReward * bonusMultiplier));
    
    // Update user coins with proper parameters
    updateCoins(coins + coinsEarned, 'game_reward', selectedGame?.id, selectedGame?.name);
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
      bestScore: Math.max(prev.bestScore, finalScore),
      gamesPlayedToday: prev.gamesPlayedToday + 1
    }));
    
    // Update challenge progress for completing coin games
    updateChallengeProgress('coin_games_completed', 1);
    checkAchievement('coin_collector');
    
    // Show completion modal
    setTimeout(() => {
      setGameInProgress(false);
      setSelectedGame(null);
      alert(`Game Complete! You earned ${coinsEarned} coins! 🎉`);
    }, 2000);
  };

  // Get base reward for each game
  const getBaseReward = (gameId) => {
    const rewards = {
      // Sports Games
      '8_ball_pool': 20,
      'archery_master': 15,
      'carrom_board': 18,
      'basketball_shoot': 12,
      
      // Racing & Action
      'car_racing': 25,
      'fps_shooter': 20,
      'bike_racing': 22,
      'helicopter_pilot': 30,
      
      // Strategy Games
      'chess_master': 35,
      'rummy_cards': 25,
      'checkers_game': 20,
      'tic_tac_toe': 8,
      
      // Quiz & Knowledge
      'kbc_quiz': 40,
      'general_knowledge': 15,
      'sports_quiz': 12,
      'bollywood_quiz': 10,
      
      // Adventure & Simulation
      'city_builder': 30,
      'treasure_hunter': 25,
      'survival_island': 35,
      'space_explorer': 40,
      
      // Lucky Games
      'lucky_spin': 15,
      'scratch_card': 20
    };
    return rewards[gameId] || 10;
  };

  // Game timer
  useEffect(() => {
    if (currentGameData.gameStarted && currentGameData.timeLeft > 0) {
      const timer = setTimeout(() => {
        setCurrentGameData(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (currentGameData.timeLeft === 0 && currentGameData.gameStarted) {
      completeGame();
    }
  }, [currentGameData.gameStarted, currentGameData.timeLeft]);

  // Keyboard controls for coin collector
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedGame?.id === 'coin_collector' && currentGameData.gameStarted) {
        const moveDistance = 5;
        const currentPos = currentGameData.playerPosition;
        
        switch(e.key) {
          case 'ArrowLeft':
            if (currentPos.x > 5) {
              setCurrentGameData(prev => ({
                ...prev,
                playerPosition: { ...prev.playerPosition, x: prev.playerPosition.x - moveDistance }
              }));
            }
            break;
          case 'ArrowRight':
            if (currentPos.x < 95) {
              setCurrentGameData(prev => ({
                ...prev,
                playerPosition: { ...prev.playerPosition, x: prev.playerPosition.x + moveDistance }
              }));
            }
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedGame?.id, currentGameData.gameStarted, currentGameData.playerPosition]);

  // Show feedback messages
  const showFeedback = (message, type) => {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#6b7280'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-weight: bold;
      z-index: 9999;
      animation: feedbackPop 1s ease-out forwards;
    `;
    
    document.body.appendChild(feedback);
    setTimeout(() => document.body.removeChild(feedback), 1000);
  };

  // Helper functions for game mechanics

  // Math Game Helper
  const generateMathQuestion = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    switch(operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 5; num2 = 3; answer = 8;
    }
    
    setCurrentGameData(prev => ({
      ...prev,
      question: `${num1} ${operation} ${num2} = ?`,
      correctAnswer: answer,
      userAnswer: '',
      gamePhase: 'playing'
    }));
  };

  // Memory Game Helper
  const showMemorySequence = (sequence) => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= sequence.length) {
        clearInterval(interval);
        setCurrentGameData(prev => ({
          ...prev,
          showingSequence: false,
          gamePhase: 'input'
        }));
        return;
      }
      
      setCurrentGameData(prev => ({
        ...prev,
        currentStep: sequence[step]
      }));
      
      step++;
    }, 1000);
  };

  // Reaction Test Helper
  const startReactionRound = () => {
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    
    setCurrentGameData(prev => ({
      ...prev,
      gamePhase: 'waiting',
      stimulus: null
    }));
    
    setTimeout(() => {
      setCurrentGameData(prev => ({
        ...prev,
        gamePhase: 'ready',
        stimulus: 'GO!',
        stimulusTime: Date.now()
      }));
    }, delay);
  };

  // KBC Quiz Helpers
  const handleKBCAnswer = (answerIndex) => {
    setCurrentGameData(prev => ({
      ...prev,
      kbc: {
        ...prev.kbc,
        selectedAnswer: answerIndex
      }
    }));
  };

  const handleKBCFinalAnswer = () => {
    const { questions, currentQuestion, selectedAnswer } = currentGameData.kbc;
    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;
    
    if (isCorrect) {
      const newWinnings = question.amount;
      if (currentQuestion === questions.length - 1) {
        // Game completed
        completeGame(newWinnings);
      } else {
        setCurrentGameData(prev => ({
          ...prev,
          kbc: {
            ...prev.kbc,
            currentQuestion: prev.kbc.currentQuestion + 1,
            winnings: newWinnings,
            selectedAnswer: null,
            timer: 30
          }
        }));
      }
    } else {
      // Wrong answer - game over
      completeGame(0);
    }
  };

  // Pool Game Helpers
  const handlePoolShot = (angle, power) => {
    setCurrentGameData(prev => ({
      ...prev,
      gamePhase: 'ball_moving',
      aimAngle: angle,
      power: power
    }));
    
    // Simulate ball physics
    setTimeout(() => {
      // Simple collision detection and ball movement simulation
      const hitBall = Math.random() > 0.3; // 70% chance to hit a ball
      
      if (hitBall) {
        const randomBall = Math.floor(Math.random() * currentGameData.poolBalls.length);
        const updatedBalls = [...currentGameData.poolBalls];
        updatedBalls[randomBall].pocketed = Math.random() > 0.6; // 40% chance to pocket
        
        setCurrentGameData(prev => ({
          ...prev,
          poolBalls: updatedBalls,
          gamePhase: 'aiming',
          score: prev.score + (updatedBalls[randomBall].pocketed ? 10 : 5)
        }));
      } else {
        setCurrentGameData(prev => ({
          ...prev,
          gamePhase: 'aiming'
        }));
      }
      
      // Check if game is over
      const remainingBalls = currentGameData.poolBalls.filter(ball => !ball.pocketed);
      if (remainingBalls.length <= 1) {
        completeGame();
      }
    }, 2000);
  };

  // Racing Game Helpers
  const updateRacingGame = () => {
    if (currentGameData.gamePhase !== 'racing') return;
    
    setCurrentGameData(prev => ({
      ...prev,
      distance: prev.distance + prev.speed,
      fuel: Math.max(0, prev.fuel - 0.1),
      obstacles: prev.obstacles.map(obstacle => ({
        ...obstacle,
        y: obstacle.y + obstacle.speed
      })).filter(obstacle => obstacle.y < 700) // Remove obstacles that are off screen
    }));
    
    // Add new obstacles
    if (Math.random() > 0.98) {
      const lanes = [100, 200, 300];
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
      
      setCurrentGameData(prev => ({
        ...prev,
        obstacles: [...prev.obstacles, {
          x: randomLane,
          y: -100,
          width: 40,
          height: 60,
          speed: Math.random() * 3 + 2
        }]
      }));
    }
    
    // Check for collisions
    const collision = currentGameData.obstacles.some(obstacle => {
      const carX = currentGameData.playerCar.x;
      const carY = currentGameData.playerCar.y;
      return (
        carX < obstacle.x + obstacle.width &&
        carX + 40 > obstacle.x &&
        carY < obstacle.y + obstacle.height &&
        carY + 60 > obstacle.y
      );
    });
    
    if (collision || currentGameData.fuel <= 0) {
      completeGame(Math.floor(currentGameData.distance / 100));
    }
  };

  // Archery Game Helpers
  const shootArrow = () => {
    const { bow, wind, distance } = currentGameData.archery;
    const power = Math.min(bow.power, 100);
    const velocity = (power / 100) * 15;
    
    setCurrentGameData(prev => ({
      ...prev,
      archery: {
        ...prev.archery,
        arrow: {
          x: bow.x + 20,
          y: bow.y,
          vx: Math.cos(bow.angle) * velocity,
          vy: Math.sin(bow.angle) * velocity,
          flying: true,
          trail: []
        },
        gamePhase: 'shooting',
        bow: { ...prev.archery.bow, drawn: false, power: 0 }
      }
    }));
  };

  // Game-specific updates and timers
  useEffect(() => {
    if (!currentGameData.gameStarted || !selectedGame) return;
    
    let gameInterval;
    
    switch(selectedGame.id) {
      case 'car_racing':
        gameInterval = setInterval(updateRacingGame, 100);
        break;
      case 'kbc_quiz':
        if (currentGameData.gamePhase === 'question' && currentGameData.questionTimer > 0) {
          gameInterval = setInterval(() => {
            setCurrentGameData(prev => ({
              ...prev,
              questionTimer: prev.questionTimer - 1
            }));
            
            if (currentGameData.questionTimer <= 1) {
              // Time's up - wrong answer
              setCurrentGameData(prev => ({
                ...prev,
                gamePhase: 'result',
                selectedAnswer: -1 // No answer selected
              }));
              
              setTimeout(() => {
                completeGame(currentGameData.winnings / 100);
              }, 2000);
            }
          }, 1000);
        }
        break;
      case 'typing_speed':
        if (currentGameData.gamePhase === 'typing') {
          gameInterval = setInterval(() => {
            const timeElapsed = (Date.now() - currentGameData.startTime) / 1000 / 60; // minutes
            const wordsTyped = currentGameData.typedText.split(' ').length;
            const wpm = Math.round(wordsTyped / timeElapsed) || 0;
            
            setCurrentGameData(prev => ({
              ...prev,
              wpm: wpm
            }));
            
            // Check if completed
            if (currentGameData.typedText === currentGameData.targetText) {
              completeGame(wpm); // Score based on WPM
            }
          }, 1000);
        }
        break;
      default:
        break;
    }
    
    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [selectedGame?.id, currentGameData.gameStarted, currentGameData.gamePhase, currentGameData.questionTimer]);

  // Additional game initialization functions for new games
  
  const initializeCarromGame = () => {
    setCurrentGameData(prev => ({
      ...prev,
      carromBoard: {
        pieces: Array.from({length: 18}, (_, i) => ({
          id: i,
          color: i < 9 ? 'white' : 'black',
          x: 200 + Math.cos(i * 0.35) * 60,
          y: 200 + Math.sin(i * 0.35) * 60,
          pocketed: false
        }))
      },
      striker: { x: 200, y: 350, power: 0, angle: 0 },
      gamePhase: 'aiming',
      playerScore: 0
    }));
  };

  const initializeBasketballGame = () => {
    setCurrentGameData(prev => ({
      ...prev,
      basketball: {
        hoop: { x: 350, y: 80, width: 60, height: 15 },
        ball: { x: 100, y: 300, vx: 0, vy: 0, radius: 15, bouncing: false },
        shots: 0,
        scores: 0,
        shotsRemaining: 10,
        gamePhase: 'aiming', // aiming, shooting, ball_moving
        trajectory: [],
        shootingPower: 0,
        shootingAngle: 45,
        wind: Math.random() * 4 - 2,
        basketEffect: false
      },
      gameStarted: true,
      gamePhase: 'playing'
    }));
  };

  const initializeBikeRacing = () => {
    setCurrentGameData(prev => ({
      ...prev,
      bike: { x: 200, y: 500, speed: 0, lane: 1 },
      track: { obstacles: [], powerUps: [] },
      gamePhase: 'racing',
      distance: 0,
      fuel: 100
    }));
  };

  const initializeHelicopterGame = () => {
    setCurrentGameData(prev => ({
      ...prev,
      helicopter: { x: 50, y: 200, altitude: 200 },
      obstacles: [],
      gamePhase: 'flying',
      distance: 0,
      fuel: 100
    }));
  };

  const initializeCheckersGame = () => {
    const board = Array(8).fill().map(() => Array(8).fill(null));
    // Initialize checkers pieces
    for(let row = 0; row < 3; row++) {
      for(let col = 0; col < 8; col++) {
        if((row + col) % 2 === 1) {
          board[row][col] = 'black';
          board[7-row][col] = 'red';
        }
      }
    }
    
    setCurrentGameData(prev => ({
      ...prev,
      checkersBoard: board,
      currentPlayer: 'red',
      selectedPiece: null,
      gamePhase: 'playing'
    }));
  };

  // Tic Tac Toe Game Logic - Complete Implementation
  const initializeTicTacToe = () => {
    setCurrentGameData(prev => ({
      ...prev,
      ticTacToe: {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        gamePhase: 'playing', // playing, won, draw
        winner: null,
        winningLine: null,
        moves: 0,
        playerScore: 0,
        aiScore: 0,
        aiDifficulty: 'medium'
      },
      gameStarted: true,
      gamePhase: 'playing'
    }));
  };

  // Tic Tac Toe Move Handler
  const handleTicTacToeMove = (index) => {
    if (!currentGameData.ticTacToe || 
        currentGameData.ticTacToe.gamePhase !== 'playing' || 
        currentGameData.ticTacToe.board[index] !== null) {
      return;
    }

    const newBoard = [...currentGameData.ticTacToe.board];
    newBoard[index] = currentGameData.ticTacToe.currentPlayer;
    
    const winner = checkTicTacToeWinner(newBoard);
    const moves = currentGameData.ticTacToe.moves + 1;
    
    setCurrentGameData(prev => ({
      ...prev,
      ticTacToe: {
        ...prev.ticTacToe,
        board: newBoard,
        moves: moves,
        winner: winner.winner,
        winningLine: winner.line,
        gamePhase: winner.winner ? 'won' : (moves === 9 ? 'draw' : 'playing'),
        currentPlayer: winner.winner || moves === 9 ? prev.ticTacToe.currentPlayer : 
                      (prev.ticTacToe.currentPlayer === 'X' ? 'O' : 'X'),
        playerScore: winner.winner === 'X' ? prev.ticTacToe.playerScore + 1 : prev.ticTacToe.playerScore,
        aiScore: winner.winner === 'O' ? prev.ticTacToe.aiScore + 1 : prev.ticTacToe.aiScore
      }
    }));

    // Handle game completion
    if (winner.winner) {
      const points = winner.winner === 'X' ? 15 : 5; // More points for player win
      setTimeout(() => {
        updateCoins(points, 'game_reward');
        setCoinsEarned(points);
        setShowCoinAnimation(true);
        setTimeout(() => setShowCoinAnimation(false), 2000);
      }, 1000);
    } else if (moves === 8) { // AI move for O player
      setTimeout(() => makeAIMove(newBoard), 500);
    }
  };

  // Check for Tic Tac Toe Winner
  const checkTicTacToeWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: lines[i] };
      }
    }
    return { winner: null, line: null };
  };

  // AI Move Logic
  const makeAIMove = (board) => {
    const emptySquares = board.map((square, index) => square === null ? index : null)
                           .filter(val => val !== null);
    
    if (emptySquares.length === 0) return;

    // Simple AI: try to win, block player, or take center/corner
    let move = findWinningMove(board, 'O') || 
               findWinningMove(board, 'X') || 
               (board[4] === null ? 4 : emptySquares[Math.floor(Math.random() * emptySquares.length)]);

    handleTicTacToeMove(move);
  };

  // Find winning move for AI
  const findWinningMove = (board, player) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] === player && board[b] === player && board[c] === null) return c;
      if (board[a] === player && board[c] === player && board[b] === null) return b;
      if (board[b] === player && board[c] === player && board[a] === null) return a;
    }
    return null;
  };

  const initializeGKQuiz = () => {
    const gkQuestions = [
      { question: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Saturn", "Mars"], correct: 1 },
      { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], correct: 2 },
      { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 }
    ];
    
    setCurrentGameData(prev => ({
      ...prev,
      quizQuestions: gkQuestions,
      currentQuestion: 0,
      score: 0,
      gamePhase: 'question'
    }));
  };

  const initializeSportsQuiz = () => {
    const sportsQuestions = [
      { question: "How many players are there in a cricket team?", options: ["10", "11", "12", "9"], correct: 1 },
      { question: "In which year did India win the Cricket World Cup?", options: ["1983", "1987", "2007", "2011"], correct: 0 },
      { question: "Who is known as the 'Captain Cool' in cricket?", options: ["Virat Kohli", "MS Dhoni", "Rohit Sharma", "Hardik Pandya"], correct: 1 }
    ];
    
    setCurrentGameData(prev => ({
      ...prev,
      quizQuestions: sportsQuestions,
      currentQuestion: 0,
      score: 0,
      gamePhase: 'question'
    }));
  };

  const initializeBollywoodQuiz = () => {
    const bollywoodQuestions = [
      { question: "Who is known as the 'King of Bollywood'?", options: ["Amitabh Bachchan", "Shah Rukh Khan", "Salman Khan", "Aamir Khan"], correct: 1 },
      { question: "Which movie won the Oscar for Best Foreign Language Film?", options: ["Lagaan", "Taare Zameen Par", "3 Idiots", "Dangal"], correct: 0 },
      { question: "Who directed the movie 'Sholay'?", options: ["Yash Chopra", "Ramesh Sippy", "Raj Kapoor", "Guru Dutt"], correct: 1 }
    ];
    
    setCurrentGameData(prev => ({
      ...prev,
      quizQuestions: bollywoodQuestions,
      currentQuestion: 0,
      score: 0,
      gamePhase: 'question'
    }));
  };

  const initializeTreasureHunter = () => {
    setCurrentGameData(prev => ({
      ...prev,
      treasureHunter: {
        map: { width: 400, height: 300 },
        player: { x: 50, y: 250, energy: 100, inventory: [], coins: 0 },
        treasures: Array.from({length: 8}, (_, i) => ({
          id: i,
          x: Math.random() * 350 + 25,
          y: Math.random() * 250 + 25,
          type: ['coin', 'gem', 'artifact', 'gold'][Math.floor(Math.random() * 4)],
          value: Math.floor(Math.random() * 50) + 10,
          found: false,
          difficulty: Math.floor(Math.random() * 3) + 1
        })),
        obstacles: Array.from({length: 5}, (_, i) => ({
          id: i,
          x: Math.random() * 350 + 25,
          y: Math.random() * 250 + 25,
          type: 'rock',
          destructible: true
        })),
        gamePhase: 'exploring', // exploring, digging, inventory
        foundTreasures: 0,
        totalValue: 0,
        moves: 0,
        timeLimit: 120
      },
      gameStarted: true,
      gamePhase: 'playing'
    }));
  };

  const initializeSurvivalIsland = () => {
    setCurrentGameData(prev => ({
      ...prev,
      island: { width: 400, height: 400 },
      player: { x: 200, y: 200, health: 100, hunger: 100, thirst: 100 },
      resources: Array.from({length: 8}, (_, i) => ({
        id: i,
        type: ['wood', 'stone', 'food', 'water'][i % 4],
        x: Math.random() * 350 + 25,
        y: Math.random() * 350 + 25,
        collected: false
      })),
      gamePhase: 'surviving',
      daysSurvived: 0
    }));
  };

  const initializeSpaceExplorer = () => {
    setCurrentGameData(prev => ({
      ...prev,
      spaceship: { x: 200, y: 350, fuel: 100, health: 100 },
      planets: Array.from({length: 4}, (_, i) => ({
        id: i,
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
        visited: false,
        resources: Math.floor(Math.random() * 30) + 10
      })),
      gamePhase: 'exploring',
      planetsVisited: 0,
      resourcesCollected: 0
    }));
  };

  const initializeDefaultGame = () => {
    setCurrentGameData(prev => ({
      ...prev,
      gamePhase: 'playing',
      score: 0,
      question: 'Click to earn coins!',
      clicks: 0,
      targetClicks: 10
    }));
  };

  // Fixed physics interval management
  useEffect(() => {
    let physicsInterval;
    
    if (currentGameData.gamePhase === 'ball_moving' && currentGameData.physicsRunning) {
      physicsInterval = setInterval(() => {
        const stillMoving = updatePoolPhysics();
        if (!stillMoving) {
          clearInterval(physicsInterval);
        }
      }, 16); // 60 FPS
    }
    
    return () => {
      if (physicsInterval) {
        clearInterval(physicsInterval);
      }
    };
      }, [currentGameData.gamePhase, currentGameData.physicsRunning]);

    // Professional Archery Power Charging (like 8 Ball Pool)
    useEffect(() => {
      let powerInterval;
      
      if (currentGameData.archery?.gamePhase === 'drawing' && currentGameData.archery?.bow.drawn) {
        powerInterval = setInterval(() => {
          setCurrentGameData(prev => {
            if (prev.archery?.bow.power >= 100) {
              return prev; // Max power reached
            }
            
            return {
              ...prev,
              archery: {
                ...prev.archery,
                bow: {
                  ...prev.archery.bow,
                  power: Math.min(prev.archery.bow.power + 2, 100)
                }
              }
            };
          });
        }, 30); // Smooth 30ms interval like 8 ball pool
      }
      
      return () => {
        if (powerInterval) clearInterval(powerInterval);
      };
    }, [currentGameData.archery?.gamePhase, currentGameData.archery?.bow.drawn]);

    // Professional Arrow Physics Loop (like 8 Ball Pool)
    useEffect(() => {
      let physicsInterval;
      
      if (currentGameData.archery?.arrow.flying) {
        physicsInterval = setInterval(() => {
          updateArcheryPhysics();
        }, 16); // 60 FPS like 8 ball pool
      }
      
      return () => {
        if (physicsInterval) clearInterval(physicsInterval);
      };
    }, [currentGameData.archery?.arrow.flying]);
  
    // Basketball Game Physics
  const handleBasketballMouseMove = (event) => {
    if (currentGameData.basketball?.gamePhase !== 'aiming') return;
    
    const rect = event.target.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (400 / rect.width);
    const mouseY = (event.clientY - rect.top) * (300 / rect.height);
    
    const ball = currentGameData.basketball.ball;
    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    const angle = Math.atan2(dy, dx);
    
    setCurrentGameData(prev => ({
      ...prev,
      basketball: {
        ...prev.basketball,
        shootingAngle: angle * (180 / Math.PI)
      }
    }));
  };

  const handleBasketballShoot = () => {
    const { ball, shootingAngle, shootingPower } = currentGameData.basketball;
    const power = shootingPower / 100;
    const velocity = power * 12;
    const angle = shootingAngle * (Math.PI / 180);
    
    setCurrentGameData(prev => ({
      ...prev,
      basketball: {
        ...prev.basketball,
        ball: {
          ...prev.basketball.ball,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          bouncing: true
        },
        gamePhase: 'ball_moving',
        shots: prev.basketball.shots + 1,
        shotsRemaining: prev.basketball.shotsRemaining - 1
      }
    }));
  };

  // City Builder Handlers
  const handleCityBuilderPlace = (x, y) => {
    const { grid, selectedBuilding, buildings, resources } = currentGameData.cityBuilder;
    
    if (grid[y][x] !== null || resources.money < buildings[selectedBuilding].cost) return;
    
    const newGrid = grid.map(row => [...row]);
    newGrid[y][x] = selectedBuilding;
    
    const newResources = { ...resources };
    newResources.money -= buildings[selectedBuilding].cost;
    
    // Apply building effects
    const building = buildings[selectedBuilding];
    if (building.population) newResources.population += building.population;
    if (building.happiness) newResources.happiness += building.happiness;
    if (building.power) newResources.power += building.power;
    if (building.water) newResources.water += building.water;
    
    setCurrentGameData(prev => ({
      ...prev,
      cityBuilder: {
        ...prev.cityBuilder,
        grid: newGrid,
        resources: newResources
      }
    }));
  };

      {/* KBC Quiz Game Interface */}
    {selectedGame?.id === 'kbc_quiz' && (
    <div style={{
      background: 'linear-gradient(135deg, #4B0082, #800080)',
      borderRadius: '15px',
      padding: '20px',
      position: 'relative',
      width: '600px',
      height: '500px',
      margin: '0 auto',
      color: '#FFF'
    }}>
      {currentGameData.kbc && (
        <>
          {/* Question Display */}
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>
              Question {currentGameData.kbc.currentQuestion + 1} for ₹{currentGameData.kbc.questions[currentGameData.kbc.currentQuestion]?.amount}
            </h3>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {currentGameData.kbc.questions[currentGameData.kbc.currentQuestion]?.question}
            </p>
          </div>

          {/* Answer Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {currentGameData.kbc.questions[currentGameData.kbc.currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleKBCAnswer(index)}
                style={{
                  padding: '15px',
                  background: currentGameData.kbc.selectedAnswer === index ? '#FFD700' : 'rgba(255,255,255,0.1)',
                  color: currentGameData.kbc.selectedAnswer === index ? '#000' : '#FFF',
                  border: '2px solid #FFD700',
                  borderRadius: '10px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {String.fromCharCode(65 + index)}: {option}
              </button>
            ))}
          </div>

          {/* Final Answer Button */}
          {currentGameData.kbc.selectedAnswer !== null && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button
                onClick={handleKBCFinalAnswer}
                style={{
                  padding: '15px 30px',
                  background: '#FF4500',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                FINAL ANSWER!
              </button>
            </div>
          )}

          {/* Lifelines */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <button style={{
              padding: '10px',
              background: currentGameData.kbc.lifelines.fiftyFifty ? '#32CD32' : '#666',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              cursor: currentGameData.kbc.lifelines.fiftyFifty ? 'pointer' : 'not-allowed'
            }}>
              50:50
            </button>
            <button style={{
              padding: '10px',
              background: currentGameData.kbc.lifelines.audiencePoll ? '#32CD32' : '#666',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              cursor: currentGameData.kbc.lifelines.audiencePoll ? 'pointer' : 'not-allowed'
            }}>
              👥 Poll
            </button>
            <button style={{
              padding: '10px',
              background: currentGameData.kbc.lifelines.phoneAFriend ? '#32CD32' : '#666',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              cursor: currentGameData.kbc.lifelines.phoneAFriend ? 'pointer' : 'not-allowed'
            }}>
              📞 Friend
            </button>
          </div>

          {/* Timer and Winnings */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              background: 'rgba(255,0,0,0.8)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              Timer: {currentGameData.kbc.timer}s
            </div>
            <div style={{
              background: 'rgba(255,215,0,0.8)',
              color: '#000',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              Winnings: ₹{currentGameData.kbc.winnings}
            </div>
          </div>
        </>
      )}
    </div>
  )}

     {/* Tic Tac Toe Game Interface */}
   {selectedGame?.id === 'tic_tac_toe' && (
    <div style={{
      background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
      borderRadius: '15px',
      padding: '20px',
      position: 'relative',
      width: '400px',
      height: '500px',
      margin: '0 auto',
      color: '#FFF'
    }}>
      {/* Game Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '5px',
        width: '300px',
        height: '300px',
        margin: '20px auto',
        background: '#000'
      }}>
        {currentGameData.ticTacToe?.board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleTicTacToeMove(index)}
            style={{
              background: '#FFF',
              border: 'none',
              fontSize: '60px',
              fontWeight: 'bold',
              color: cell === 'X' ? '#FF0000' : '#0000FF',
              cursor: cell === null ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={cell !== null || currentGameData.ticTacToe?.gamePhase !== 'playing'}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Game Status */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {currentGameData.ticTacToe?.gamePhase === 'playing' && (
          <p style={{ fontSize: '18px' }}>
            Current Player: <span style={{ color: '#FFD700' }}>
              {currentGameData.ticTacToe.currentPlayer === 'X' ? 'You (X)' : 'AI (O)'}
            </span>
          </p>
        )}
        {currentGameData.ticTacToe?.gamePhase === 'won' && (
          <p style={{ fontSize: '20px', color: '#32CD32' }}>
            {currentGameData.ticTacToe.winner === 'X' ? 'You Win!' : 'AI Wins!'}
          </p>
        )}
        {currentGameData.ticTacToe?.gamePhase === 'draw' && (
          <p style={{ fontSize: '20px', color: '#FFD700' }}>It's a Draw!</p>
        )}
      </div>

      {/* Score Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px'
      }}>
        <div>You: {currentGameData.ticTacToe?.playerScore || 0}</div>
        <div>AI: {currentGameData.ticTacToe?.aiScore || 0}</div>
      </div>
    </div>
  )}

     {/* City Builder Game Interface */}
   {selectedGame?.id === 'city_builder' && (
    <div style={{
      background: 'linear-gradient(135deg, #059669, #10B981)',
      borderRadius: '15px',
      padding: '20px',
      position: 'relative',
      width: '700px',
      height: '600px',
      margin: '0 auto',
      color: '#FFF'
    }}>
      {/* Resource Panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px'
      }}>
        <div>💰 ${currentGameData.cityBuilder?.resources.money || 0}</div>
        <div>👥 {currentGameData.cityBuilder?.resources.population || 0}</div>
        <div>😊 {currentGameData.cityBuilder?.resources.happiness || 0}%</div>
        <div>⚡ {currentGameData.cityBuilder?.resources.power || 0}</div>
        <div>💧 {currentGameData.cityBuilder?.resources.water || 0}</div>
      </div>

      {/* Building Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gridTemplateRows: 'repeat(10, 1fr)',
        gap: '2px',
        width: '400px',
        height: '400px',
        margin: '0 auto 20px auto',
        background: '#000'
      }}>
        {currentGameData.cityBuilder?.grid.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => handleCityBuilderPlace(x, y)}
              style={{
                background: cell ? '#8B4513' : '#90EE90',
                border: '1px solid #333',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {cell && getBuildingIcon(cell)}
            </button>
          ))
        )}
      </div>

      {/* Building Selection */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {Object.entries(currentGameData.cityBuilder?.buildings || {}).map(([type, building]) => (
          <button
            key={type}
            onClick={() => setCurrentGameData(prev => ({
              ...prev,
              cityBuilder: { ...prev.cityBuilder, selectedBuilding: type }
            }))}
            style={{
              padding: '8px 12px',
              background: currentGameData.cityBuilder?.selectedBuilding === type ? '#FFD700' : 'rgba(255,255,255,0.2)',
              color: currentGameData.cityBuilder?.selectedBuilding === type ? '#000' : '#FFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {getBuildingIcon(type)} ${building.cost}
          </button>
        ))}
      </div>
    </div>
  )}

     {/* Treasure Hunter Game Interface */}
   {selectedGame?.id === 'treasure_hunter' && (
    <div style={{
      background: 'linear-gradient(135deg, #8B4513, #D2691E)',
      borderRadius: '15px',
      padding: '20px',
      position: 'relative',
      width: '500px',
      height: '400px',
      margin: '0 auto'
    }}>
      <svg width="500" height="400">
        {/* Map background */}
        <rect x="0" y="0" width="500" height="400" fill="#F4A460" />
        
        {/* Treasures */}
        {currentGameData.treasureHunter?.treasures?.map((treasure) => (
          <g key={treasure.id}>
            {!treasure.found && (
              <circle
                cx={treasure.x}
                cy={treasure.y}
                r="8"
                fill="#FFD700"
                stroke="#FF8C00"
                strokeWidth="2"
              />
            )}
          </g>
        ))}
        
        {/* Obstacles */}
        {currentGameData.treasureHunter?.obstacles?.map((obstacle) => (
          <rect
            key={obstacle.id}
            x={obstacle.x - 10}
            y={obstacle.y - 10}
            width="20"
            height="20"
            fill="#696969"
            stroke="#000"
            strokeWidth="1"
          />
        ))}
        
        {/* Player */}
        <circle
          cx={currentGameData.treasureHunter?.player.x}
          cy={currentGameData.treasureHunter?.player.y}
          r="12"
          fill="#FF0000"
          stroke="#000"
          strokeWidth="2"
        />
        
        {/* HUD */}
        <text x="20" y="30" fontSize="16" fill="#000" fontWeight="bold">
          Treasures: {currentGameData.treasureHunter?.foundTreasures || 0}/8
        </text>
        <text x="20" y="50" fontSize="14" fill="#000">
          Value: ${currentGameData.treasureHunter?.totalValue || 0}
        </text>
        <text x="20" y="70" fontSize="14" fill="#000">
          Energy: {currentGameData.treasureHunter?.player.energy || 100}%
        </text>
      </svg>
    </div>
  )}

  // Helper function for building icons
  const getBuildingIcon = (buildingType) => {
    const icons = {
      house: '🏠',
      shop: '🏪',
      factory: '🏭',
      park: '🌳',
      powerPlant: '⚡',
      waterTower: '💧'
    };
    return icons[buildingType] || '❓';
  };

  return (
    <div className="container animate-fadeInUp" style={{ 
      padding: '1rem 0.5rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,32,46,0.95))',
      position: 'relative'
    }}>
      {/* Professional Coin Animation */}
      {showCoinAnimation && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
            animation: 'coinBounce 2s ease-out',
            border: '4px solid #FFE55C'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#8B4513',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              animation: 'coinGlow 1s infinite alternate'
            }}>
              🪙
            </div>
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            animation: 'fadeInScale 2s ease-out'
          }}>
            +{coinsEarned} Coins!
          </div>
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            right: '-20px',
            bottom: '-20px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulseGlow 2s ease-out'
          }}></div>
        </div>
      )}

      {/* Header Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.1))',
        borderRadius: '15px',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <h1 style={{
          color: 'var(--primary-gold)',
          fontSize: '2.5rem',
          fontWeight: '900',
          marginBottom: '0.5rem',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          🪙 Coin Games Arena
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}>
          Play games, earn coins, convert to real money! (1000 coins = ₹10)
        </p>
        
        {/* Stats Display */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.8rem',
          marginTop: '1rem'
        }}>
          <div style={{
            background: 'rgba(0, 173, 181, 0.2)',
            padding: '0.8rem',
            borderRadius: '10px',
            border: '1px solid var(--accent-color)'
          }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>🪙</div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>
              {coins || 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              Your Coins
            </div>
          </div>
          
          <div style={{
            background: 'rgba(34, 197, 94, 0.2)',
            padding: '0.8rem',
            borderRadius: '10px',
            border: '1px solid var(--accent-green)'
          }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--accent-green)' }}>🎮</div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>
              {gameStats.totalGames}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              Games Played
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 215, 0, 0.2)',
            padding: '0.8rem',
            borderRadius: '10px',
            border: '1px solid var(--primary-gold)'
          }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--primary-gold)' }}>💰</div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>
              {gameStats.totalCoinsEarned}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
              Total Earned
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid - Compact Single Grid Layout */}
      {!gameInProgress && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.8rem'
        }}>
          {Object.entries(gameCategories).flatMap(([category, games]) => 
            games.map((game) => (
              <div
                key={game.id}
                onClick={() => showAdvertisement(game)}
                style={{
                  background: game.color,
                  borderRadius: '10px',
                  padding: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  minHeight: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.02)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {/* Dark overlay for better text readability */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px'
                }} />

                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '0.3rem',
                  right: '0.3rem',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '8px',
                  fontSize: '0.6rem',
                  fontWeight: '600',
                  zIndex: 2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {Object.entries(gameCategories).find(([cat, catGames]) => catGames.includes(game))?.[0]}
                </div>

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                  <div style={{ 
                    fontSize: '1.8rem', 
                    marginBottom: '0.3rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                  }}>
                    {game?.icon || '🎮'}
                  </div>
                  
                  <h3 style={{
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    marginBottom: '0.2rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {game?.name || 'Game'}
                  </h3>
                  
                  <p style={{
                    color: '#fff',
                    fontSize: '0.7rem',
                    marginBottom: '0.5rem',
                    lineHeight: '1.1',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                  }}>
                    {game.description}
                  </p>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.3rem',
                  marginBottom: '0.5rem',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    padding: '0.2rem',
                    borderRadius: '4px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ 
                      color: '#fff', 
                      fontSize: '0.6rem', 
                      fontWeight: '600',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      Reward
                    </div>
                    <div style={{ 
                      color: '#FFD700', 
                      fontSize: '0.7rem', 
                      fontWeight: '700',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>
                      {game.coinReward}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    padding: '0.2rem',
                    borderRadius: '4px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ 
                      color: '#fff', 
                      fontSize: '0.6rem', 
                      fontWeight: '600',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      Duration
                    </div>
                    <div style={{ 
                      color: '#00D2FF', 
                      fontSize: '0.7rem', 
                      fontWeight: '700',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>
                      {game.duration}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '0.7rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  zIndex: 2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  📺 Watch Ad & Play
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ad Modal - Made Less Intrusive */}
      {showAdModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', // Reduced opacity from 0.95 to 0.7
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)' // Added blur effect
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            padding: '2rem', // Reduced from 3rem
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '400px', // Reduced from 500px
            width: '85%', // Reduced from 90%
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Skip Button */}
            <button
              onClick={skipAd}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
            <h2 style={{
              color: '#fff',
              fontSize: '1.5rem', // Reduced from 2rem
              fontWeight: '700',
              marginBottom: '0.8rem'
            }}>
              Advertisement
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem', // Reduced from 1.2rem
              marginBottom: '1.5rem'
            }}>
              Please watch this ad to support the platform and unlock your game!
            </p>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '1.5rem', // Reduced from 2rem
              borderRadius: '15px',
              marginBottom: '1.5rem',
              border: '2px dashed rgba(255, 255, 255, 0.5)'
            }}>
              <div style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.8rem' }}>
                🎯 Sample Advertisement Space
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Your revenue-generating ad content would appear here
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '0.8rem',
              borderRadius: '12px',
              fontSize: '1.2rem', // Reduced from 1.5rem
              fontWeight: '700',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Game starts in: {adCountdown}s</span>
              <button
                onClick={skipAd}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.8rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Skip Ad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Game Interface with Dynamic Content */}
      {selectedGame && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 32, 46, 0.95), rgba(45, 55, 72, 0.95))',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative'
        }}>
          {/* Game Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{
                color: 'var(--primary-gold)',
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {selectedGame?.icon} {selectedGame?.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                Score: {currentGameData.score} | Time: {Math.floor(currentGameData.timeLeft / 60)}:{(currentGameData.timeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
            
            <button
              onClick={exitGame}
              style={{
                background: 'var(--accent-red)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Exit Game
            </button>
          </div>

          {/* 8 Ball Pool Game Interface - Professional & Eye-Catching Design */}
          {selectedGame?.id === '8_ball_pool' && (
            <div style={{
              background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
              borderRadius: '20px',
              padding: '30px',
              border: '3px solid #d4af37',
              position: 'relative',
              maxWidth: '800px', // Increased to accommodate larger table
              margin: '0 auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              
              {/* Game Status Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '15px 20px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(255, 215, 0, 0.05))',
                borderRadius: '15px',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #d4af37, #ffd700)',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    🎯 Score: {currentGameData.score || 0}
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    🎱 Shot: {currentGameData.shotCount || 0}
                  </div>
                </div>
                
                {currentGameData.playerGroup && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      background: currentGameData.playerGroup === 'solid' ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 'linear-gradient(135deg, #74b9ff, #0984e3)',
                      padding: '5px 12px',
                      borderRadius: '15px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      You: {currentGameData.playerGroup}s
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Pool Table */}
              <div style={{
                background: 'linear-gradient(145deg, #8B4513, #A0522D)',
                borderRadius: '20px',
                padding: '25px',
                position: 'relative',
                boxShadow: 'inset 0 8px 16px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.2)',
                overflow: 'auto' // Allow scrolling if needed
              }}>
                
                {/* Felt Surface - Updated for Larger Size */}
                <div style={{
                  background: 'radial-gradient(ellipse at center, #0F5132, #0A4025)',
                  borderRadius: '15px',
                  position: 'relative',
                  width: '700px', // Increased from 500px
                  height: '500px', // Increased from 400px
                  margin: '0 auto',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.4)',
                  border: '3px solid #2F4F2F'
                }}>
                  
                  {/* Pool Table SVG with Enhanced Graphics - Larger Size */}
                  <svg
                    width="700" // Increased from 500
                    height="500" // Increased from 400
                    style={{ 
                      cursor: currentGameData.gamePhase === 'aiming' ? 'crosshair' : 'default',
                      borderRadius: '15px'
                    }}
                    onMouseMove={handlePoolMouseMove}
                    onMouseDown={handlePoolMouseDown}
                    onMouseUp={handlePoolMouseUp}
                  >
                    {/* Table felt with pattern */}
                    <defs>
                      <pattern id="feltPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <rect width="60" height="60" fill="#0F5132"/>
                        <circle cx="30" cy="30" r="1.5" fill="#134e32" opacity="0.3"/>
                      </pattern>
                      
                      <radialGradient id="ballGradient" cx="30%" cy="30%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.9)"/>
                        <stop offset="70%" stopColor="rgba(255,255,255,0.3)"/>
                        <stop offset="100%" stopColor="rgba(0,0,0,0.4)"/>
                      </radialGradient>
                      
                      <filter id="ballShadow">
                        <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.6)"/>
                      </filter>
                      
                      <linearGradient id="pocketGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#000000"/>
                        <stop offset="100%" stopColor="#444444"/>
                      </linearGradient>
                    </defs>
                    
                    <rect x="0" y="0" width="700" height="500" fill="url(#feltPattern)" />
                    
                    {/* Table rails with realistic design - Updated for larger table */}
                    <rect x="35" y="35" width="630" height="430" fill="none" stroke="#8B4513" strokeWidth="8" rx="15"/>
                    <rect x="30" y="30" width="640" height="440" fill="none" stroke="#D2691E" strokeWidth="3" rx="18"/>
                    
                    {/* Corner markings - Updated positions */}
                    <circle cx="140" cy="250" r="3" fill="rgba(255,255,255,0.4)"/>
                    <circle cx="560" cy="250" r="3" fill="rgba(255,255,255,0.4)"/>
                    
                                          {/* Professional Pockets with 3D effect - MUCH LARGER for easier potting */}
                      {currentGameData.pockets?.map((pocket, index) => (
                        <g key={index}>
                          {/* Outer pocket rim */}
                          <circle
                            cx={pocket.x}
                            cy={pocket.y}
                            r={pocket.radius + 6}
                            fill="#8B4513"
                          />
                          {/* Main pocket opening */}
                          <circle
                            cx={pocket.x}
                            cy={pocket.y}
                            r={pocket.radius}
                            fill="url(#pocketGradient)"
                            stroke="#654321"
                            strokeWidth="3"
                          />
                          {/* Inner black hole */}
                          <circle
                            cx={pocket.x - 2}
                            cy={pocket.y - 2}
                            r={pocket.radius - 6}
                            fill="rgba(0,0,0,0.95)"
                          />
                          {/* Pocket highlight for visibility */}
                          <circle
                            cx={pocket.x - 4}
                            cy={pocket.y - 4}
                            r={pocket.radius - 8}
                            fill="rgba(255,255,255,0.1)"
                          />
                        </g>
                      ))}
                    
                    {/* Enhanced Pool Balls with Professional Rendering - Larger Size */}
                    {currentGameData.poolBalls?.map((ball) => {
                      if (ball.pocketed) return null;
                      
                      return (
                        <g key={ball.id}>
                          {/* Ball with realistic gradient and shine */}
                          <circle
                            cx={ball.x}
                            cy={ball.y}
                            r={ball.radius}
                            fill={ball.color}
                            filter="url(#ballShadow)"
                            stroke={ball.type === 'cue' ? '#E0E0E0' : '#333'}
                            strokeWidth="1"
                          />
                          
                          {/* Ball shine effect */}
                          <circle
                            cx={ball.x}
                            cy={ball.y}
                            r={ball.radius}
                            fill="url(#ballGradient)"
                          />
                          
                          {/* Stripe pattern for striped balls - Larger */}
                          {ball.type === 'stripe' && (
                            <g>
                              <rect
                                x={ball.x - ball.radius}
                                y={ball.y - 4}
                                width={ball.radius * 2}
                                height="8"
                                fill="#FFF"
                                rx="2"
                              />
                              <rect
                                x={ball.x - ball.radius + 2}
                                y={ball.y - 3}
                                width={ball.radius * 2 - 4}
                                height="6"
                                fill={ball.color}
                                rx="1"
                              />
                            </g>
                          )}
                          
                          {/* Ball number with enhanced styling - Larger */}
                          {ball.number && (
                            <g>
                              <circle
                                cx={ball.x}
                                cy={ball.y}
                                r="8"
                                fill="#FFF"
                                stroke="#333"
                                strokeWidth="1"
                              />
                              <text
                                x={ball.x}
                                y={ball.y + 3}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="bold"
                                fill="#000"
                                fontFamily="Arial, sans-serif"
                              >
                                {ball.number}
                              </text>
                            </g>
                          )}
                          
                          {/* Special styling for 8-ball - Larger */}
                          {ball.type === '8ball' && (
                            <g>
                              <circle
                                cx={ball.x}
                                cy={ball.y}
                                r="8"
                                fill="#FFF"
                                stroke="#333"
                                strokeWidth="1"
                              />
                              <text
                                x={ball.x}
                                y={ball.y + 3}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="bold"
                                fill="#000"
                                fontFamily="Arial, sans-serif"
                              >
                                8
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                    
                    {/* Professional Cue Stick - Larger */}
                    {currentGameData.showCue && currentGameData.gamePhase === 'aiming' && (
                      <g>
                        <line
                          x1={currentGameData.cuePosition?.x}
                          y1={currentGameData.cuePosition?.y}
                          x2={currentGameData.cuePosition?.x - Math.cos(currentGameData.aimAngle) * 100}
                          y2={currentGameData.cuePosition?.y - Math.sin(currentGameData.aimAngle) * 100}
                          stroke="linear-gradient(to right, #8B4513, #D2691E)"
                          strokeWidth="10"
                          strokeLinecap="round"
                        />
                        <line
                          x1={currentGameData.cuePosition?.x - Math.cos(currentGameData.aimAngle) * 80}
                          y1={currentGameData.cuePosition?.y - Math.sin(currentGameData.aimAngle) * 80}
                          x2={currentGameData.cuePosition?.x - Math.cos(currentGameData.aimAngle) * 100}
                          y2={currentGameData.cuePosition?.y - Math.sin(currentGameData.aimAngle) * 100}
                          stroke="#FFD700"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                    
                                          {/* Enhanced Aim Line with Trajectory Prediction */}
                      {currentGameData.gamePhase === 'aiming' && (
                        <g>
                          {/* Main aim line */}
                          <line
                            x1={currentGameData.poolBalls?.[0]?.x}
                            y1={currentGameData.poolBalls?.[0]?.y}
                            x2={currentGameData.poolBalls?.[0]?.x + Math.cos(currentGameData.aimAngle) * 150}
                            y2={currentGameData.poolBalls?.[0]?.y + Math.sin(currentGameData.aimAngle) * 150}
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth="4"
                            strokeDasharray="12,6"
                            opacity="0.8"
                          />
                          
                          {/* Extended trajectory line (fainter) */}
                          <line
                            x1={currentGameData.poolBalls?.[0]?.x + Math.cos(currentGameData.aimAngle) * 150}
                            y1={currentGameData.poolBalls?.[0]?.y + Math.sin(currentGameData.aimAngle) * 150}
                            x2={currentGameData.poolBalls?.[0]?.x + Math.cos(currentGameData.aimAngle) * 250}
                            y2={currentGameData.poolBalls?.[0]?.y + Math.sin(currentGameData.aimAngle) * 250}
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="2"
                            strokeDasharray="6,8"
                            opacity="0.6"
                          />
                          
                          {/* Aiming circle around cue ball */}
                          <circle
                            cx={currentGameData.poolBalls?.[0]?.x}
                            cy={currentGameData.poolBalls?.[0]?.y}
                            r="25"
                            fill="none"
                            stroke="rgba(255,215,0,0.3)"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                        </g>
                      )}
                    
                                          {/* Professional Power Bar with Enhanced Animations */}
                      {currentGameData.gamePhase === 'charging' && (
                        <g>
                          {/* Power bar background with glow */}
                          <rect 
                            x="598" y="68" width="39" height="144" 
                            fill="rgba(0,0,0,0.1)" 
                            stroke="#FFD700" 
                            strokeWidth="1" 
                            rx="20" 
                            opacity="0.5"
                          />
                          <rect 
                            x="600" y="70" width="35" height="140" 
                            fill="rgba(0,0,0,0.9)" 
                            stroke="#FFD700" 
                            strokeWidth="3" 
                            rx="18"
                          />
                          
                          {/* Power level indicator with pulsing effect */}
                          <rect
                            x="605"
                            y={205 - (currentGameData.power || 0) * 1.3}
                            width="25"
                            height={(currentGameData.power || 0) * 1.3}
                            fill={
                              currentGameData.power > 80 ? 'linear-gradient(to top, #ff4444, #ff8888)' : 
                              currentGameData.power > 50 ? 'linear-gradient(to top, #ffaa00, #ffdd44)' : 
                              'linear-gradient(to top, #44ff44, #88ff88)'
                            }
                            rx="12"
                            opacity={currentGameData.powerPulse || 0.9}
                          />
                          
                          {/* Power level glow effect */}
                          <rect
                            x="603"
                            y={207 - (currentGameData.power || 0) * 1.3}
                            width="29"
                            height={(currentGameData.power || 0) * 1.3}
                            fill={
                              currentGameData.power > 80 ? 'rgba(255,68,68,0.3)' : 
                              currentGameData.power > 50 ? 'rgba(255,170,0,0.3)' : 
                              'rgba(68,255,68,0.3)'
                            }
                            rx="14"
                            opacity="0.6"
                          />
                          
                          {/* Power bar segments for better visual feedback */}
                          {[...Array(10)].map((_, i) => (
                            <line
                              key={i}
                              x1="605"
                              y1={205 - i * 14}
                              x2="630"
                              y2={205 - i * 14}
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Power bar labels with better positioning */}
                          <text x="645" y="85" fontSize="12" fill="#FFD700" fontWeight="bold">MAX</text>
                          <text x="645" y="205" fontSize="12" fill="#FFD700" fontWeight="bold">MIN</text>
                          
                          {/* Current power percentage display */}
                          <text 
                            x="617" 
                            y="225" 
                            fontSize="14" 
                            fill="#FFD700" 
                            fontWeight="bold" 
                            textAnchor="middle"
                          >
                            {Math.round(currentGameData.power || 0)}%
                          </text>
                          
                          {/* Charging instruction */}
                          <text 
                            x="617" 
                            y="245" 
                            fontSize="10" 
                            fill="rgba(255,215,0,0.8)" 
                            textAnchor="middle"
                          >
                            Release to shoot
                          </text>
                        </g>
                      )}
                  </svg>
                  
                                      {/* Professional Game Status Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
                      color: '#FFD700',
                      padding: '8px 15px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {currentGameData.gamePhase === 'aiming' && '🎯 Precision Aiming - Ultra-slow near ball, normal at distance'}
                      {currentGameData.gamePhase === 'charging' && '⚡ Power Charging - Release to shoot'}
                      {currentGameData.gamePhase === 'ball_moving' && '🎱 Balls in motion...'}
                      {currentGameData.gamePhase === 'game_over' && `🏆 ${currentGameData.winner === 'player' ? 'You Win!' : 'AI Wins!'}`}
                    </div>
                  
                  {/* Pocketed Balls Display */}
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    display: 'flex',
                    gap: '8px',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
                    padding: '8px 12px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    {currentGameData.pocketedBalls?.slice(0, 8).map((ball, index) => (
                      <div
                        key={index}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: ball.color,
                          border: '2px solid #FFD700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: ball.type === 'stripe' ? '#000' : '#FFF',
                          fontWeight: 'bold'
                        }}
                      >
                        {ball.number}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Game Instructions */}
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(255, 215, 0, 0.05))',
                borderRadius: '15px',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <h4 style={{ 
                  color: '#FFD700', 
                  margin: '0 0 15px 0',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  🎱 How to Play Professional Pool
                </h4>
                
                                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '15px',
                      color: '#E0E0E0',
                      fontSize: '0.9rem'
                    }}>
                      <div>
                        <strong style={{ color: '#FFD700' }}>🎯 Precision Aiming:</strong>
                        <br />Ultra-slow near ball, normal at distance
                      </div>
                      <div>
                        <strong style={{ color: '#FFD700' }}>⚡ Power Control:</strong>
                        <br />Hold for smooth power charging
                      </div>
                      <div>
                        <strong style={{ color: '#FFD700' }}>🕳️ Large Pockets:</strong>
                        <br />Easy potting with bigger holes
                      </div>
                      <div>
                        <strong style={{ color: '#FFD700' }}>🎱 Objective:</strong>
                        <br />Clear your group, then sink 8-ball
                      </div>
                    </div>
              </div>
            </div>
          )}

                        {/* Professional Archery Master - Tournament Grade */}
              {selectedGame?.id === 'archery_master' && (
                <div style={{
                  background: 'linear-gradient(145deg, #1a2b3a, #0f1d2b)',
                  borderRadius: '20px',
                  padding: '25px',
                  position: 'relative',
                  width: '700px',
                  height: '500px',
                  margin: '0 auto',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                  border: '2px solid #d4af37'
                }}>
                  {/* Tournament Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(255, 215, 0, 0.05))',
                    padding: '15px 20px',
                    borderRadius: '12px',
                    marginBottom: '15px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #d4af37, #ffd700)',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {currentGameData.archery?.tournament?.level === 1 && '🏹 Training Level'}
                        {currentGameData.archery?.tournament?.level === 2 && '🏆 Club Championship'}
                        {currentGameData.archery?.tournament?.level === 3 && '🥉 National Tournament'}
                        {currentGameData.archery?.tournament?.level === 4 && '🥇 Olympic Level'}
                      </div>
                      
                      <div style={{
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        Score: {currentGameData.archery?.scoring?.totalScore || 0}
                      </div>
                      
                      <div style={{
                        background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        End: {currentGameData.archery?.scoring?.currentEnd || 1}/6
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#FFD700'
                    }}>
                      Distance: {currentGameData.archery?.target?.distance || 50}m
                    </div>
                  </div>

                  {/* Professional Range */}
                  <div style={{
                    background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 30%, #90EE90 100%)',
                    borderRadius: '15px',
                    position: 'relative',
                    width: '650px',
                    height: '350px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <svg
                      width="650"
                      height="350"
                      style={{ cursor: 'crosshair' }}
                      onMouseMove={handleArcheryMouseMove}
                      onMouseDown={handleArcheryMouseDown}
                      onMouseUp={handleArcheryMouseUp}
                    >
                      {/* Range Background Effects */}
                      <defs>
                        <radialGradient id="targetGlow" cx="50%" cy="50%">
                          <stop offset="0%" stopColor="rgba(255,215,0,0.3)"/>
                          <stop offset="100%" stopColor="rgba(255,215,0,0)"/>
                        </radialGradient>
                        
                        <filter id="targetShadow">
                          <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="rgba(0,0,0,0.4)"/>
                        </filter>
                        
                        <linearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B4513"/>
                          <stop offset="50%" stopColor="#D2B48C"/>
                          <stop offset="100%" stopColor="#8B4513"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Shooting Line */}
                      <line x1="80" y1="0" x2="80" y2="350" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="10,5"/>
                      
                      {/* Professional Target with 3D Effect */}
                      <g transform={`translate(${currentGameData.archery?.target.x}, ${currentGameData.archery?.target.y})`}>
                        {/* Target Stand */}
                        <rect x="-8" y="100" width="16" height="80" fill="#8B4513" stroke="#654321" strokeWidth="2"/>
                        <rect x="-12" y="175" width="24" height="15" fill="#654321"/>
                        
                        {/* Target Face with Olympic Rings */}
                        <circle cx="0" cy="0" r="125" fill="#FFFFFF" stroke="#333" strokeWidth="3" filter="url(#targetShadow)"/>
                        
                        {currentGameData.archery?.target.rings.map((ring, index) => (
                          <g key={index}>
                            <circle
                              cx="0"
                              cy="0"
                              r={ring.radius * (currentGameData.archery?.difficulty?.targetSize || 1)}
                              fill={ring.color}
                              stroke="#333"
                              strokeWidth="1.5"
                              opacity="0.9"
                            />
                            {ring.name && ring.radius < 50 && (
                              <text
                                x="0"
                                y={ring.radius * (currentGameData.archery?.difficulty?.targetSize || 1) - 8}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="bold"
                                fill={ring.color === '#FFFFFF' ? '#000' : '#FFF'}
                              >
                                {ring.name}
                              </text>
                            )}
                          </g>
                        )).reverse()}
                        
                                                 {/* Target Center Highlight */}
                         <circle cx="0" cy="0" r="120" fill="url(#targetGlow)" opacity="0.5"/>
                         
                         {/* Shot Arrows on Target */}
                         {currentGameData.archery?.scoring?.arrows?.map((shotArrow, index) => (
                           <g key={index}>
                             <circle
                               cx={shotArrow.x - currentGameData.archery.target.x}
                               cy={shotArrow.y - currentGameData.archery.target.y}
                               r="3"
                               fill="#8B4513"
                               stroke="#654321"
                               strokeWidth="1"
                             />
                             <text
                               x={shotArrow.x - currentGameData.archery.target.x}
                               y={shotArrow.y - currentGameData.archery.target.y - 8}
                               textAnchor="middle"
                               fontSize="10"
                               fontWeight="bold"
                               fill="#FFD700"
                             >
                               {shotArrow.points}
                             </text>
                           </g>
                         ))}
                       </g>
                      
                      {/* Professional Bow */}
                      <g transform={`translate(${currentGameData.archery?.bow.x}, ${currentGameData.archery?.bow.y})`}>
                        {/* Bow Riser */}
                        <rect
                          x="-3"
                          y="-25"
                          width="6"
                          height="50"
                          fill="url(#bowGradient)"
                          stroke="#654321"
                          strokeWidth="1"
                          rx="3"
                          transform={`rotate(${(currentGameData.archery?.bow.angle || 0) * 180 / Math.PI})`}
                        />
                        
                        {/* Bow Limbs */}
                        <path
                          d="M 0,-25 Q -15,-40 -20,-60 M 0,25 Q -15,40 -20,60"
                          stroke="#8B4513"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          transform={`rotate(${(currentGameData.archery?.bow.angle || 0) * 180 / Math.PI})`}
                        />
                        
                        {/* Bowstring */}
                        {currentGameData.archery?.bow.drawn ? (
                          <g>
                            <path
                              d="M 0,-25 Q -10,-30 -15,-55 M 0,25 Q -10,30 -15,55"
                              stroke="#DDD"
                              strokeWidth="2"
                              fill="none"
                              transform={`rotate(${(currentGameData.archery?.bow.angle || 0) * 180 / Math.PI})`}
                            />
                            <line
                              x1="0"
                              y1="0"
                              x2={Math.cos(currentGameData.archery.bow.angle) * (currentGameData.archery.bow.power || 0) * 0.3}
                              y2={Math.sin(currentGameData.archery.bow.angle) * (currentGameData.archery.bow.power || 0) * 0.3}
                              stroke="#FFD700"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </g>
                        ) : (
                          <path
                            d="M 0,-25 Q -20,-35 -25,-60 M 0,25 Q -20,35 -25,60"
                            stroke="#DDD"
                            strokeWidth="2"
                            fill="none"
                            transform={`rotate(${(currentGameData.archery?.bow.angle || 0) * 180 / Math.PI})`}
                          />
                        )}
                        
                        {/* Sight */}
                        {currentGameData.archery?.bow.sight && (
                          <circle
                            cx="10"
                            cy="0"
                            r="8"
                            fill="none"
                            stroke="#FFD700"
                            strokeWidth="2"
                            transform={`rotate(${(currentGameData.archery?.bow.angle || 0) * 180 / Math.PI})`}
                          />
                        )}
                      </g>
                      
                      {/* Arrow in Flight with Trail */}
                      {currentGameData.archery?.arrow.flying && (
                        <g>
                          {/* Arrow Trail */}
                          {currentGameData.archery.arrow.trail?.map((point, index) => (
                            <circle
                              key={index}
                              cx={point.x}
                              cy={point.y}
                              r={3 - index * 0.2}
                              fill="rgba(255,215,0,0.6)"
                              opacity={1 - index * 0.1}
                            />
                          ))}
                          
                          {/* Arrow Shaft */}
                          <line
                            x1={currentGameData.archery.arrow.x - 15}
                            y1={currentGameData.archery.arrow.y}
                            x2={currentGameData.archery.arrow.x + 15}
                            y2={currentGameData.archery.arrow.y}
                            stroke="#8B4513"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          
                          {/* Arrow Point */}
                          <polygon
                            points={`${currentGameData.archery.arrow.x + 15},${currentGameData.archery.arrow.y} ${currentGameData.archery.arrow.x + 20},${currentGameData.archery.arrow.y - 3} ${currentGameData.archery.arrow.x + 20},${currentGameData.archery.arrow.y + 3}`}
                            fill="#C0C0C0"
                          />
                          
                          {/* Fletching */}
                          <polygon
                            points={`${currentGameData.archery.arrow.x - 15},${currentGameData.archery.arrow.y} ${currentGameData.archery.arrow.x - 20},${currentGameData.archery.arrow.y - 5} ${currentGameData.archery.arrow.x - 20},${currentGameData.archery.arrow.y + 5}`}
                            fill="#FF0000"
                          />
                        </g>
                      )}
                      
                      {/* Wind Indicator */}
                      <g transform="translate(550, 50)">
                        <rect x="-25" y="-15" width="50" height="30" fill="rgba(0,0,0,0.7)" rx="15"/>
                        <text x="0" y="-5" textAnchor="middle" fontSize="10" fill="#FFF" fontWeight="bold">
                          💨 Wind
                        </text>
                        <text x="0" y="8" textAnchor="middle" fontSize="12" fill="#FFD700" fontWeight="bold">
                          {Math.round(currentGameData.archery?.environment?.wind?.speed || 0)} m/s
                        </text>
                      </g>
                      
                      {/* Steadiness Meter */}
                      <g transform="translate(50, 300)">
                        <rect x="-25" y="-15" width="50" height="30" fill="rgba(0,0,0,0.7)" rx="15"/>
                        <text x="0" y="-5" textAnchor="middle" fontSize="10" fill="#FFF" fontWeight="bold">
                          🎯 Steady
                        </text>
                        <text x="0" y="8" textAnchor="middle" fontSize="12" 
                              fill={(currentGameData.archery?.bow?.steadiness || 100) > 90 ? '#00FF00' : 
                                   (currentGameData.archery?.bow?.steadiness || 100) > 70 ? '#FFFF00' : '#FF0000'} 
                              fontWeight="bold">
                          {Math.round(currentGameData.archery?.bow?.steadiness || 100)}%
                        </text>
                      </g>
                      
                      {/* Professional Power Meter (like 8 Ball Pool) */}
                      {currentGameData.archery?.gamePhase === 'drawing' && (
                        <g transform="translate(600, 280)">
                          {/* Power Meter Background */}
                          <rect x="-15" y="-50" width="30" height="100" fill="rgba(0,0,0,0.9)" stroke="#FFD700" strokeWidth="3" rx="15" filter="url(#targetShadow)"/>
                          
                          {/* Power Segments (like pool cue power) */}
                          {[...Array(10)].map((_, i) => (
                            <rect
                              key={i}
                              x="-8"
                              y={40 - i * 9}
                              width="16"
                              height="6"
                              fill={
                                currentGameData.archery.bow.power >= (i + 1) * 10 ? 
                                (i < 3 ? '#00FF00' : i < 7 ? '#FFFF00' : '#FF4444') : 
                                'rgba(255,255,255,0.3)'
                              }
                              rx="2"
                              opacity={currentGameData.archery.bow.power >= (i + 1) * 10 ? 1 : 0.3}
                            />
                          ))}
                          
                          {/* Pulsing Power Glow */}
                          {currentGameData.archery.bow.power > 90 && (
                            <rect 
                              x="-15" y="-50" width="30" height="100" 
                              fill="none" 
                              stroke="#FF0000" 
                              strokeWidth="2" 
                              rx="15"
                              opacity="0.8"
                              style={{animation: 'coinGlow 0.5s infinite alternate'}}
                            />
                          )}
                          
                          {/* Power Percentage */}
                          <text x="0" y="65" textAnchor="middle" fontSize="12" fill="#FFD700" fontWeight="bold">
                            {Math.round(currentGameData.archery.bow.power || 0)}%
                          </text>
                          
                          {/* Release Instruction */}
                          <text x="0" y="78" textAnchor="middle" fontSize="8" fill="#FFF">
                            Release to Shoot
                          </text>
                        </g>
                      )}
                      
                      {/* Game Completed State */}
                      {currentGameData.archery?.gamePhase === 'completed' && (
                        <g transform="translate(325, 175)">
                          <rect x="-100" y="-60" width="200" height="120" fill="rgba(0,0,0,0.9)" stroke="#FFD700" strokeWidth="3" rx="15"/>
                          <text x="0" y="-30" textAnchor="middle" fontSize="18" fill="#FFD700" fontWeight="bold">
                            End Complete!
                          </text>
                          <text x="0" y="-5" textAnchor="middle" fontSize="16" fill="#FFF">
                            Final Score: {currentGameData.archery?.scoring?.totalScore || 0}
                          </text>
                          <text x="0" y="15" textAnchor="middle" fontSize="14" fill="#FFF">
                            Arrows Shot: {6 - (currentGameData.archery?.scoring?.shotsRemaining || 0)}
                          </text>
                          <text x="0" y="40" textAnchor="middle" fontSize="12" fill="#00FF00" fontWeight="bold">
                            Click Exit Game to continue
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Professional Controls Info */}
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.9rem',
                    color: '#E0E0E0'
                  }}>
                    <div>
                      <strong style={{ color: '#FFD700' }}>🎯 Aim:</strong> Move mouse to aim
                      <div style={{ fontSize: '0.8rem', color: '#AAA' }}>Steady = {Math.round(currentGameData.archery?.bow?.steadiness || 100)}%</div>
                    </div>
                    <div>
                      <strong style={{ color: '#FFD700' }}>⚡ Power:</strong> Hold & release mouse
                      <div style={{ fontSize: '0.8rem', color: '#AAA' }}>
                        {currentGameData.archery?.gamePhase === 'drawing' ? 'Charging...' : 
                         currentGameData.archery?.gamePhase === 'shooting' ? 'Arrow Flying...' : 'Ready to Shoot'}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: '#FFD700' }}>🏹 Arrows:</strong> {currentGameData.archery?.scoring?.shotsRemaining || 6} remaining
                      <div style={{ fontSize: '0.8rem', color: '#AAA' }}>Score: {currentGameData.archery?.scoring?.totalScore || 0}</div>
                    </div>
                  </div>
                </div>
              )}

          {/* Basketball Shots Game Interface */}
          {selectedGame?.id === 'basketball_shoot' && (
            <div style={{
              background: 'linear-gradient(135deg, #FF8C00, #FF4500)',
              borderRadius: '15px',
              padding: '20px',
              position: 'relative',
              width: '500px',
              height: '400px',
              margin: '0 auto'
            }}>
              <svg width="500" height="400" onMouseMove={handleBasketballMouseMove}>
                {/* Basketball court */}
                <rect x="0" y="0" width="500" height="400" fill="#8B4513" />
                
                {/* Hoop */}
                <g transform={`translate(${currentGameData.basketball?.hoop.x}, ${currentGameData.basketball?.hoop.y})`}>
                  <ellipse cx="0" cy="0" rx="30" ry="8" fill="#FF0000" stroke="#000" strokeWidth="3" />
                  <line x1="-25" y1="0" x2="-25" y2="30" stroke="#FFF" strokeWidth="2" />
                  <line x1="25" y1="0" x2="25" y2="30" stroke="#FFF" strokeWidth="2" />
                </g>
                
                {/* Basketball */}
                <circle
                  cx={currentGameData.basketball?.ball.x}
                  cy={currentGameData.basketball?.ball.y}
                  r={currentGameData.basketball?.ball.radius}
                  fill="#FF8C00"
                  stroke="#000"
                  strokeWidth="2"
                />
                
                {/* Trajectory line */}
                {currentGameData.basketball?.gamePhase === 'aiming' && (
                  <line
                    x1={currentGameData.basketball.ball.x}
                    y1={currentGameData.basketball.ball.y}
                    x2={currentGameData.basketball.ball.x + Math.cos(currentGameData.basketball.shootingAngle * Math.PI / 180) * 100}
                    y2={currentGameData.basketball.ball.y + Math.sin(currentGameData.basketball.shootingAngle * Math.PI / 180) * 100}
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                )}
                
                {/* Score display */}
                <text x="20" y="30" fontSize="16" fill="#FFF" fontWeight="bold">
                  Score: {currentGameData.basketball?.scores || 0}/{currentGameData.basketball?.shots || 0}
                </text>
                <text x="20" y="50" fontSize="14" fill="#FFF">
                  Shots Left: {currentGameData.basketball?.shotsRemaining || 0}
                </text>
              </svg>
              
              {currentGameData.basketball?.gamePhase === 'aiming' && (
                <button
                  onClick={handleBasketballShoot}
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '10px 20px',
                    background: '#FFD700',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  SHOOT! 🏀
                </button>
              )}
            </div>
          )}

          {/* Street Racer Game Interface */}
          {selectedGame?.id === 'car_racing' && (
            <div style={{
              background: 'linear-gradient(135deg, #2F4F4F, #696969)',
              borderRadius: '15px',
              padding: '20px',
              position: 'relative',
              width: '500px',
              height: '400px',
              margin: '0 auto'
            }}>
              <svg width="500" height="400">
                {/* Race track */}
                <rect x="0" y="0" width="500" height="400" fill="#555" />
                <rect x="0" y="130" width="500" height="4" fill="#FFF" />
                <rect x="0" y="260" width="500" height="4" fill="#FFF" />
                
                {/* Player car */}
                <g transform={`translate(${currentGameData.racing?.car.x}, ${currentGameData.racing?.car.y})`}>
                  <rect x="-15" y="-10" width="30" height="20" fill="#FF0000" rx="5" />
                  <circle cx="-10" cy="-8" r="3" fill="#000" />
                  <circle cx="10" cy="-8" r="3" fill="#000" />
                  <circle cx="-10" cy="8" r="3" fill="#000" />
                  <circle cx="10" cy="8" r="3" fill="#000" />
                </g>
                
                {/* Opponent cars */}
                {currentGameData.racing?.opponents?.map((opponent, index) => (
                  <g key={index} transform={`translate(${opponent.x}, ${opponent.y})`}>
                    <rect x="-15" y="-10" width="30" height="20" fill={opponent.color} rx="5" />
                  </g>
                ))}
                
                {/* HUD */}
                <text x="20" y="30" fontSize="16" fill="#FFF" fontWeight="bold">
                  Speed: {Math.round(currentGameData.racing?.car.speed || 0)} mph
                </text>
                <text x="20" y="50" fontSize="14" fill="#FFF">
                  Lap: {currentGameData.racing?.lap || 1}/{currentGameData.racing?.totalLaps || 3}
                </text>
                <text x="20" y="70" fontSize="14" fill="#FFF">
                  Fuel: {Math.round(currentGameData.racing?.car.fuel || 100)}%
                </text>
              </svg>
              
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: '#FFF',
                fontSize: '12px'
              }}>
                Use arrow keys to control your car
              </div>
            </div>
          )}

          {/* FPS Target Shooter Game Interface */}
          {selectedGame?.id === 'fps_shooter' && (
            <div style={{
              background: 'linear-gradient(135deg, #000, #333)',
              borderRadius: '15px',
              padding: '20px',
              position: 'relative',
              width: '500px',
              height: '400px',
              margin: '0 auto',
              cursor: 'crosshair'
            }}>
              <svg width="500" height="400">
                {/* Targets */}
                {currentGameData.fps?.targets?.map((target) => (
                  <g key={target.id}>
                    <circle
                      cx={target.x}
                      cy={target.y}
                      r={target.size}
                      fill={target.hit ? '#666' : '#FF0000'}
                      stroke="#FFF"
                      strokeWidth="2"
                    />
                    <text
                      x={target.x}
                      y={target.y + 5}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#FFF"
                      fontWeight="bold"
                    >
                      {target.points}
                    </text>
                  </g>
                ))}
                
                {/* Crosshair */}
                <g transform={`translate(${currentGameData.fps?.crosshair.x}, ${currentGameData.fps?.crosshair.y})`}>
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#00FF00" strokeWidth="2" />
                  <line x1="0" y1="-10" x2="0" y2="10" stroke="#00FF00" strokeWidth="2" />
                  <circle cx="0" cy="0" r="15" fill="none" stroke="#00FF00" strokeWidth="1" />
                </g>
                
                {/* HUD */}
                <text x="20" y="30" fontSize="16" fill="#00FF00" fontWeight="bold">
                  Ammo: {currentGameData.fps?.ammo || 0}
                </text>
                <text x="20" y="50" fontSize="14" fill="#00FF00">
                  Hits: {currentGameData.fps?.hits || 0}/{currentGameData.fps?.totalShots || 0}
                </text>
                <text x="20" y="70" fontSize="14" fill="#00FF00">
                  Accuracy: {Math.round(currentGameData.fps?.accuracy || 100)}%
                </text>
              </svg>
            </div>
          )}

                        {/* Other games will show simple interface */}
              {!['8_ball_pool', 'archery_master', 'basketball_shoot', 'car_racing', 'fps_shooter', 'kbc_quiz', 'tic_tac_toe', 'city_builder', 'treasure_hunter'].includes(selectedGame?.id) && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {selectedGame?.icon}
              </div>
              <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>
                {selectedGame?.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {selectedGame?.description}
              </p>
              
              {currentGameData.gamePhase === 'instruction' && (
                <div>
                  <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    Get ready to play {selectedGame?.name}!
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Game starting in a few seconds...
                  </p>
                </div>
              )}
              
              {currentGameData.gamePhase === 'playing' && (
                <div>
                  {currentGameData.question && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginBottom: '1.5rem'
                    }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        {currentGameData.question}
                      </h4>
                      
                      <input
                        type="text"
                        value={currentGameData.userAnswer}
                        onChange={(e) => setCurrentGameData(prev => ({
                          ...prev,
                          userAnswer: e.target.value
                        }))}
                        placeholder="Enter your answer..."
                        style={{
                          width: '200px',
                          padding: '0.8rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          background: 'var(--glass-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '1rem',
                          marginRight: '1rem'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            // Handle answer submission for different games
                            if (selectedGame.id === 'quick_math') {
                              if (parseInt(currentGameData.userAnswer) === currentGameData.correctAnswer) {
                                setCurrentGameData(prev => ({
                                  ...prev,
                                  score: prev.score + 10,
                                  userAnswer: ''
                                }));
                                generateMathQuestion();
                              } else {
                                setCurrentGameData(prev => ({
                                  ...prev,
                                  userAnswer: ''
                                }));
                              }
                            }
                          }
                        }}
                      />
                      
                      <button
                        onClick={() => {
                          // Handle answer submission
                          if (selectedGame.id === 'quick_math') {
                            if (parseInt(currentGameData.userAnswer) === currentGameData.correctAnswer) {
                              setCurrentGameData(prev => ({
                                ...prev,
                                score: prev.score + 10,
                                userAnswer: ''
                              }));
                              generateMathQuestion();
                            }
                          }
                        }}
                        style={{
                          background: 'var(--primary-gold)',
                          color: '#000',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.8rem 1.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'var(--accent-green)', fontSize: '1.5rem', fontWeight: '700' }}>
                        {currentGameData.score}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Score</div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'var(--accent-blue)', fontSize: '1.5rem', fontWeight: '700' }}>
                        {currentGameData.level}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Level</div>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'var(--accent-red)', fontSize: '1.5rem', fontWeight: '700' }}>
                        {currentGameData.lives}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Lives</div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentGameData.gameFinished && (
                <div>
                  <h3 style={{ color: 'var(--accent-green)', marginBottom: '1rem' }}>
                    🎉 Game Complete!
                  </h3>
                  <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    Final Score: {currentGameData.score}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Calculating your coin reward...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes slideInDown {
          from { 
            opacity: 0; 
            transform: translateY(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
          }
          50% { 
            transform: scale(1.05); 
          }
        }

        @keyframes bounceIn {
          0% { 
            opacity: 0;
            transform: scale(0.3); 
          }
          50% { 
            opacity: 1;
            transform: scale(1.05); 
          }
          70% { 
            transform: scale(0.9); 
          }
          100% { 
            opacity: 1;
            transform: scale(1); 
          }
        }

        @keyframes patternShow {
          0% { 
            opacity: 0;
            transform: scale(0) rotate(180deg); 
          }
          100% { 
            opacity: 1;
            transform: scale(1) rotate(0deg); 
          }
        }

        @keyframes feedbackPop {
          0% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5); 
          }
          80% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1); 
          }
          100% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(1); 
          }
        }
        
        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 4px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
};

export default CoinGames; 