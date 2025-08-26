import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { notificationHelper } from '../utils/notificationHelper';
import { handleFirebaseError, isFirebaseOnline } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(1000);
  const [gameWalletBalance, setGameWalletBalance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyBonus, setDailyBonus] = useState({
    lastClaimDate: null,
    currentStreak: 0,
    totalClaimed: 0,
    canClaim: false
  });
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState({
    totalBets: 0,
    totalWins: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: 0,
    gamesPlayed: 0,
    winStreak: 0,
    currentStreak: 0,
    favoriteGame: ''
  });
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referredUsers: [],
    totalEarnings: 0,
    pendingRewards: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user); // Set user first, regardless of online status
        
        // Check if online before making Firestore calls
        if (!isFirebaseOnline()) {
          console.warn('📱 App is offline - using default values for user data');
          setWalletBalance(1000); // Default balance for offline mode
          setError('You are currently offline. Some features may be limited.');
          setLoading(false);
          return;
        }
        
        try {
          // Check ban status before proceeding
          const banStatus = await walletService.checkUserBanStatus(user.uid);
          
          if (banStatus.isBanned) {
            // User is banned, sign them out
            await authService.logout();
            setUser(null);
            setWalletBalance(0);
            
            let banMessage = `🚫 Your account has been banned.\n\nReason: ${banStatus.reason || 'Violation of terms'}`;
            
            if (banStatus.expiresAt) {
              const expiryDate = banStatus.expiresAt.toLocaleDateString();
              banMessage += `\n\nYour ban will expire on: ${expiryDate}`;
            } else {
              banMessage += '\n\nThis is a permanent ban.';
            }
            
            banMessage += '\n\nIf you believe this is an error, please contact support.';
            
            alert(banMessage);
            setLoading(false);
            return;
          }
          
          // User is not banned, load wallet balance
          const balance = await walletService.getWalletBalance(user.uid);
          setWalletBalance(balance || 1000); // Default to 1000 if no balance found
          setError(null); // Clear any previous errors
        } catch (error) {
          const errorResult = handleFirebaseError(error, { walletBalance: 1000 });
          
          if (errorResult.offline) {
            console.warn('📱 Firestore offline - using fallback data');
            setWalletBalance(errorResult.data.walletBalance);
            setError('You are currently offline. Some features may be limited.');
          } else {
            console.error('Error during auth state change:', error);
            setError('Failed to load user data. Please check your connection.');
            setWalletBalance(1000); // Fallback balance
          }
        }
      } else {
        setUser(null);
        setWalletBalance(0);
        setError(null);
      }
      setLoading(false);
    });

    // Initialize achievements and referral data when component mounts
    initializeAchievements();
    if (user) {
      initializeReferralData();
    }

    return unsubscribe;
  }, []);

  // Periodic ban checking while user is active (only when online)
  useEffect(() => {
    if (!user) return;

    const checkBanStatus = async () => {
      // Skip ban checking if offline
      if (!isFirebaseOnline()) {
        console.log('📱 Skipping ban check - app is offline');
        return;
      }
      
      try {
        const banStatus = await walletService.checkUserBanStatus(user.uid);
        
        if (banStatus.isBanned) {
          // User got banned while using the site
          await authService.logout();
          setUser(null);
          setWalletBalance(0);
          
          let banMessage = `🚫 Your account has been banned.\n\nReason: ${banStatus.reason || 'Violation of terms'}`;
          
          if (banStatus.expiresAt) {
            const expiryDate = banStatus.expiresAt.toLocaleDateString();
            banMessage += `\n\nYour ban will expire on: ${expiryDate}`;
          } else {
            banMessage += '\n\nThis is a permanent ban.';
          }
          
          banMessage += '\n\nIf you believe this is an error, please contact support.';
          
          alert(banMessage);
          window.location.reload(); // Force refresh to login page
        }
      } catch (error) {
        console.error('Error checking ban status:', error);
      }
    };

    // Check ban status every 30 seconds while user is active
    const banCheckInterval = setInterval(checkBanStatus, 30000);

    // Also check on window focus (when user returns to tab)
    const handleFocus = () => {
      checkBanStatus();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(banCheckInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Periodic ban checking while user is active
  useEffect(() => {
    if (!user) return;

    const checkBanStatus = async () => {
      try {
        const banStatus = await walletService.checkUserBanStatus(user.uid);
        
        if (banStatus.isBanned) {
          // User got banned while using the site
          await authService.logout();
          setUser(null);
          setWalletBalance(0);
          
          let banMessage = `🚫 Your account has been banned.\n\nReason: ${banStatus.reason || 'Violation of terms'}`;
          
          if (banStatus.expiresAt) {
            const expiryDate = banStatus.expiresAt.toLocaleDateString();
            banMessage += `\n\nYour ban will expire on: ${expiryDate}`;
          } else {
            banMessage += '\n\nThis is a permanent ban.';
          }
          
          banMessage += '\n\nIf you believe this is an error, please contact support.';
          
          alert(banMessage);
          window.location.reload(); // Force refresh to login page
        }
      } catch (error) {
        console.error('Error checking ban status:', error);
      }
    };

    // Check ban status every 30 seconds while user is active
    const banCheckInterval = setInterval(checkBanStatus, 30000);

    // Also check on window focus (when user returns to tab)
    const handleFocus = () => {
      checkBanStatus();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(banCheckInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Achievement System
  const initializeAchievements = () => {
    const stored = localStorage.getItem('achievements');
    const storedStats = localStorage.getItem('userStats');
    
    if (stored) {
      setAchievements(JSON.parse(stored));
    } else {
      const defaultAchievements = [
        {
          id: 'first_win',
          name: 'First Victory',
          description: 'Win your first game',
          icon: '🏆',
          reward: 100,
          unlocked: false,
          progress: 0,
          target: 1,
          type: 'wins'
        },
        {
          id: 'high_roller',
          name: 'High Roller',
          description: 'Place a bet of ₹1000 or more',
          icon: '💎',
          reward: 500,
          unlocked: false,
          progress: 0,
          target: 1,
          type: 'high_bet'
        },
        {
          id: 'hot_streak',
          name: 'Hot Streak',
          description: 'Win 5 games in a row',
          icon: '🔥',
          reward: 300,
          unlocked: false,
          progress: 0,
          target: 5,
          type: 'streak'
        },
        {
          id: 'lucky_seven',
          name: 'Lucky Seven',
          description: 'Win exactly 7 games total',
          icon: '🍀',
          reward: 777,
          unlocked: false,
          progress: 0,
          target: 7,
          type: 'total_wins'
        },
        {
          id: 'game_explorer',
          name: 'Game Explorer',
          description: 'Play all 13 different games',
          icon: '🎮',
          reward: 1000,
          unlocked: false,
          progress: 0,
          target: 13,
          type: 'games_played'
        },
        {
          id: 'big_winner',
          name: 'Big Winner',
          description: 'Win ₹5000 in a single game',
          icon: '💰',
          reward: 750,
          unlocked: false,
          progress: 0,
          target: 5000,
          type: 'single_win'
        },
        {
          id: 'veteran_player',
          name: 'Veteran Player',
          description: 'Place 100 total bets',
          icon: '🎯',
          reward: 500,
          unlocked: false,
          progress: 0,
          target: 100,
          type: 'total_bets'
        },
        {
          id: 'millionaire',
          name: 'Millionaire',
          description: 'Win ₹100,000 total',
          icon: '👑',
          reward: 5000,
          unlocked: false,
          progress: 0,
          target: 100000,
          type: 'total_winnings'
        }
      ];
      setAchievements(defaultAchievements);
      localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
    }
    
    if (storedStats) {
      setUserStats(JSON.parse(storedStats));
    } else {
      const defaultStats = {
        totalBets: 0,
        totalWins: 0,
        totalWagered: 0,
        totalWon: 0,
        biggestWin: 0,
        gamesPlayed: 0,
        winStreak: 0,
        currentStreak: 0,
        favoriteGame: '',
        gamesPlayedList: []
      };
      setUserStats(defaultStats);
      localStorage.setItem('userStats', JSON.stringify(defaultStats));
    }
  };

  const checkAchievements = (gameResult = null, betAmount = 0, gameName = '') => {
    const updatedAchievements = [...achievements];
    const updatedStats = { ...userStats };
    let newUnlocks = [];

    // Update stats
    if (gameResult !== null) {
      updatedStats.totalBets += 1;
      updatedStats.totalWagered += betAmount;
      
      if (gameResult.isWin) {
        updatedStats.totalWins += 1;
        updatedStats.totalWon += gameResult.winAmount;
        updatedStats.currentStreak += 1;
        updatedStats.winStreak = Math.max(updatedStats.winStreak, updatedStats.currentStreak);
        updatedStats.biggestWin = Math.max(updatedStats.biggestWin, gameResult.winAmount);
      } else {
        updatedStats.currentStreak = 0;
      }

      // Track unique games played
      if (gameName && !updatedStats.gamesPlayedList?.includes(gameName)) {
        updatedStats.gamesPlayedList = [...(updatedStats.gamesPlayedList || []), gameName];
        updatedStats.gamesPlayed = updatedStats.gamesPlayedList.length;
      }
    }

    // Check each achievement
    updatedAchievements.forEach((achievement, index) => {
      if (achievement.unlocked) return;

      let currentProgress = achievement.progress;
      let shouldUpdate = false;

      switch (achievement.type) {
        case 'wins':
          currentProgress = updatedStats.totalWins;
          shouldUpdate = true;
          break;
        case 'high_bet':
          if (betAmount >= 1000) {
            currentProgress = 1;
            shouldUpdate = true;
          }
          break;
        case 'streak':
          currentProgress = updatedStats.currentStreak;
          shouldUpdate = true;
          break;
        case 'total_wins':
          currentProgress = updatedStats.totalWins;
          shouldUpdate = true;
          break;
        case 'games_played':
          currentProgress = updatedStats.gamesPlayed;
          shouldUpdate = true;
          break;
        case 'single_win':
          if (gameResult?.isWin && gameResult.winAmount >= achievement.target) {
            currentProgress = gameResult.winAmount;
            shouldUpdate = true;
          }
          break;
        case 'total_bets':
          currentProgress = updatedStats.totalBets;
          shouldUpdate = true;
          break;
        case 'total_winnings':
          currentProgress = updatedStats.totalWon;
          shouldUpdate = true;
          break;
      }

      if (shouldUpdate) {
        updatedAchievements[index].progress = currentProgress;
        
        if (currentProgress >= achievement.target && !achievement.unlocked) {
          updatedAchievements[index].unlocked = true;
          newUnlocks.push(achievement);
          
          // Add reward to wallet
          const newBalance = walletBalance + achievement.reward;
          setWalletBalance(newBalance);
          localStorage.setItem('walletBalance', newBalance.toString());
        }
      }
    });

    setAchievements(updatedAchievements);
    setUserStats(updatedStats);
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    localStorage.setItem('userStats', JSON.stringify(updatedStats));

    // Show achievement notifications
    newUnlocks.forEach(achievement => {
      notificationHelper.showAchievementNotification(achievement.name, achievement.reward);
    });

    return newUnlocks;
  };

  const showAchievementNotification = (achievement) => {
    // Create achievement notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, var(--primary-gold), var(--secondary-gold));
      color: #000;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 3000;
      animation: slideInFromRight 0.5s ease-out;
      max-width: 300px;
      font-weight: 600;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <div style="font-size: 2rem;">${achievement.icon}</div>
        <div>
          <div style="font-size: 1rem; margin-bottom: 0.3rem;">Achievement Unlocked!</div>
          <div style="font-size: 0.9rem; opacity: 0.8;">${achievement.name}</div>
          <div style="font-size: 0.8rem; margin-top: 0.3rem;">+₹${achievement.reward}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutToRight 0.5s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 4000);
  };

  const getAchievementProgress = (achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    return Math.min(100, (achievement.progress / achievement.target) * 100);
  };

  // Daily Bonus System
  const checkDailyBonus = () => {
    console.log('🎁 Checking daily bonus availability...');
    
    // Get today's date in YYYY-MM-DD format for accurate comparison
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('dailyBonus');
    
    if (stored) {
      const bonusData = JSON.parse(stored);
      const lastClaimDate = bonusData.lastClaimDate ? new Date(bonusData.lastClaimDate).toISOString().split('T')[0] : null;
      
      // Get yesterday's date for streak checking
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log('🎁 Date comparison:', { today, lastClaimDate, yesterday });
      
      if (lastClaimDate === today) {
        // Already claimed today - cannot claim again
        console.log('🎁 Already claimed today - hiding gift box');
        setDailyBonus({ ...bonusData, canClaim: false });
      } else if (lastClaimDate === yesterday) {
        // Can claim and continue streak
        console.log('🎁 Can claim bonus and continue streak');
        setDailyBonus({ ...bonusData, canClaim: true });
      } else if (lastClaimDate && lastClaimDate < yesterday) {
        // Streak broken, reset but can still claim
        console.log('🎁 Streak broken, resetting to 0');
        setDailyBonus({
          lastClaimDate: bonusData.lastClaimDate,
          currentStreak: 0,
          totalClaimed: bonusData.totalClaimed,
          canClaim: true
        });
      } else {
        // Future date or other edge case - can claim
        console.log('🎁 Edge case - allowing claim');
        setDailyBonus({ ...bonusData, canClaim: true });
      }
    } else {
      // First time user
      console.log('🎁 First time user - can claim bonus');
      setDailyBonus({
        lastClaimDate: null,
        currentStreak: 0,
        totalClaimed: 0,
        canClaim: true
      });
    }
  };

  const claimDailyBonus = () => {
    console.log('🎁 Claiming daily bonus...');
    
    const today = new Date().toISOString();
    const newStreak = dailyBonus.currentStreak + 1;
    
    // Calculate bonus amount based on streak
    let bonusAmount = 50; // Base amount
    if (newStreak >= 7) bonusAmount = 500; // Week bonus
    else if (newStreak >= 5) bonusAmount = 200;
    else if (newStreak >= 3) bonusAmount = 100;
    else bonusAmount = 50 * newStreak;
    
    const newBonusData = {
      lastClaimDate: today,
      currentStreak: newStreak,
      totalClaimed: dailyBonus.totalClaimed + bonusAmount,
      canClaim: false // Immediately set to false to hide gift box
    };
    
    console.log('🎁 Bonus claimed:', { bonusAmount, newStreak, newBonusData });
    
    // Update state immediately to hide gift box
    setDailyBonus(newBonusData);
    localStorage.setItem('dailyBonus', JSON.stringify(newBonusData));
    
    // Add to wallet
    const newBalance = walletBalance + bonusAmount;
    setWalletBalance(newBalance);
    localStorage.setItem('walletBalance', newBalance.toString());
    
    // Show notification
    notificationHelper.showBonusNotification(bonusAmount, 'daily-bonus');
    
    console.log('🎁 Daily bonus claimed successfully! Gift box should now be hidden.');
    
    return bonusAmount;
  };

  const getDailyBonusRewards = () => {
    return [
      { day: 1, amount: 50, icon: '🪙' },
      { day: 2, amount: 100, icon: '💰' },
      { day: 3, amount: 150, icon: '🎁' },
      { day: 4, amount: 200, icon: '💎' },
      { day: 5, amount: 250, icon: '🏆' },
      { day: 6, amount: 300, icon: '🌟' },
      { day: 7, amount: 500, icon: '👑' }
    ];
  };

  // Referral System
  const generateReferralCode = (userId) => {
    // Generate a unique referral code based on user ID
    const baseCode = userId?.slice(-6) || Math.random().toString(36).slice(-6);
    return `GMS${baseCode.toUpperCase()}`;
  };

  const initializeReferralData = () => {
    const stored = localStorage.getItem('referralData');
    if (stored) {
      setReferralData(JSON.parse(stored));
    } else if (user) {
      const newReferralData = {
        referralCode: generateReferralCode(user.uid || user.email),
        referredUsers: [],
        totalEarnings: 0,
        pendingRewards: 0
      };
      setReferralData(newReferralData);
      localStorage.setItem('referralData', JSON.stringify(newReferralData));
    }
  };

  const processReferral = async (referralCode) => {
    try {
      // Simulate API call to process referral
      console.log('Processing referral with code:', referralCode);
      
      // Check if referral code is valid and not self-referral
      if (referralCode === referralData.referralCode) {
        throw new Error('Cannot use your own referral code');
      }

      // Mock referral processing
      const referralReward = 100; // ₹100 for both referrer and referee
      
      // Add reward to current user's wallet
      const newBalance = walletBalance + referralReward;
      setWalletBalance(newBalance);
      localStorage.setItem('walletBalance', newBalance.toString());

      // Show success notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, var(--accent-green), #00CC70);
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        animation: slideInFromRight 0.5s ease-out;
        max-width: 300px;
        font-weight: 600;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <div style="font-size: 2rem;">🎉</div>
          <div>
            <div style="font-size: 1rem; margin-bottom: 0.3rem;">Referral Success!</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">Welcome bonus: ₹${referralReward}</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOutToRight 0.5s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      }, 4000);

      return { success: true, reward: referralReward };
    } catch (error) {
      console.error('Referral processing error:', error);
      throw error;
    }
  };

  const addReferredUser = (userEmail, referralReward = 50) => {
    const updatedReferralData = {
      ...referralData,
      referredUsers: [
        ...referralData.referredUsers,
        {
          email: userEmail,
          date: new Date().toISOString(),
          reward: referralReward,
          status: 'completed'
        }
      ],
      totalEarnings: referralData.totalEarnings + referralReward
    };

    setReferralData(updatedReferralData);
    localStorage.setItem('referralData', JSON.stringify(updatedReferralData));

    // Add reward to wallet
    const newBalance = walletBalance + referralReward;
    setWalletBalance(newBalance);
    localStorage.setItem('walletBalance', newBalance.toString());

    return updatedReferralData;
  };

  const shareReferralCode = async (method = 'copy') => {
    const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`;
    const shareText = `🎮 Join GMS Gaming with my referral code: ${referralData.referralCode}\n\n💰 Get ₹100 welcome bonus when you sign up!\n\n🔗 ${referralLink}`;

    try {
      if (method === 'copy') {
        await navigator.clipboard.writeText(shareText);
        
        // Show copy success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 80px;
          right: 20px;
          background: var(--primary-gold);
          color: #000;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          z-index: 3000;
          animation: slideInFromRight 0.5s ease-out;
          font-weight: 600;
        `;
        
        notification.innerHTML = `📋 Referral code copied to clipboard!`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.animation = 'slideOutToRight 0.5s ease-out';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 500);
        }, 2000);

        return { success: true, message: 'Copied to clipboard' };
      } else if (method === 'whatsapp') {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        return { success: true, message: 'WhatsApp opened' };
      } else if (method === 'telegram') {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🎮 Join GMS Gaming and get ₹100 welcome bonus!')}`;
        window.open(telegramUrl, '_blank');
        return { success: true, message: 'Telegram opened' };
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true, message: 'Copied to clipboard (fallback)' };
    }
  };

  const getReferralStats = () => {
    return {
      totalReferrals: referralData.referredUsers.length,
      totalEarnings: referralData.totalEarnings,
      pendingRewards: referralData.pendingRewards,
      recentReferrals: referralData.referredUsers.slice(-5).reverse()
    };
  };

  const register = async (email, password, name = null) => {
    try {
      setError(null);
      console.log('🔄 Starting registration process for:', email);
      
      // Use name from parameter or extract from email
      const userName = name || email.split('@')[0];
      console.log('👤 Using username:', userName);
      
      const user = await authService.register(email, password, userName);
      console.log('✅ User registered successfully:', user.uid);
      
      setUser(user);
      setWalletBalance(1000); // Initial balance
      console.log('💰 Initial wallet balance set to 1000');
      
      return user;
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const user = await authService.login(email, password);
      setUser(user);
      const balance = await walletService.getWalletBalance(user.uid);
      setWalletBalance(balance || 0);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const user = await authService.loginWithGoogle();
      setUser(user);
      const balance = await walletService.getWalletBalance(user.uid);
      setWalletBalance(balance || 0);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setWalletBalance(0);
    } catch (error) {
      setError(error.message);
    }
  };

  const updateWalletBalance = async (amount, type, gameId = null, gameName = null) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const newBalance = await walletService.updateWalletBalance(
        user.uid, 
        amount, 
        type, 
        gameId, 
        gameName
      );
      setWalletBalance(newBalance || 0);
      return newBalance;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateGameWalletBalance = async (amount, type, gameId = null, gameName = null) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const newBalance = await walletService.updateGameWalletBalance(
        user.uid, 
        amount, 
        type, 
        gameId, 
        gameName
      );
      setGameWalletBalance(newBalance || 0);
      return newBalance;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateCoins = async (amount, type = 'game_reward', gameId = null, gameName = null) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Ensure type is never undefined
      const safeType = type || 'game_reward';
      
      const newCoins = await walletService.updateCoins(
        user.uid, 
        amount, 
        safeType, 
        gameId, 
        gameName
      );
      setCoins(newCoins || 0);
      return newCoins;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const placeBet = async (betAmount, gameId, gameName) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Check if user is banned before allowing bet
      const banStatus = await walletService.checkUserBanStatus(user.uid);
      if (banStatus.isBanned) {
        await authService.logout();
        setUser(null);
        setWalletBalance(0);
        
        let banMessage = `🚫 Your account has been banned and you cannot place bets.\n\nReason: ${banStatus.reason || 'Violation of terms'}`;
        
        if (banStatus.expiresAt) {
          const expiryDate = banStatus.expiresAt.toLocaleDateString();
          banMessage += `\n\nYour ban will expire on: ${expiryDate}`;
        } else {
          banMessage += '\n\nThis is a permanent ban.';
        }
        
        banMessage += '\n\nIf you believe this is an error, please contact support.';
        
        throw new Error(banMessage);
      }
      
      const newBalance = await walletService.placeBet(user.uid, betAmount, gameId, gameName);
      setWalletBalance(newBalance || 0);
      return newBalance;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const processGameResult = async (betAmount, multiplier, gameId, gameName, isWin) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const result = await walletService.processGameResult(
        user.uid, 
        betAmount, 
        multiplier, 
        gameId, 
        gameName, 
        isWin
      );
      setWalletBalance(result.newBalance || 0);
      
      // Check achievements after processing game result
      const gameResult = {
        isWin,
        winAmount: isWin ? betAmount * multiplier : 0,
        betAmount,
        multiplier,
        gameId,
        gameName
      };
      
      checkAchievements(gameResult, betAmount, gameName);
      
      // Show win notification
      if (isWin) {
        const winAmount = betAmount * multiplier;
        notificationHelper.showWinNotification(winAmount, gameName, multiplier);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Create signup alias for consistency
  const signup = register;

  const value = {
    user,
    walletBalance,
    gameWalletBalance,
    coins,
    loading,
    error,
    register,
    signup, // Add signup alias
    login,
    loginWithGoogle,
    logout,
    updateWalletBalance,
    updateGameWalletBalance,
    updateCoins,
    placeBet,
    processGameResult,
    dailyBonus,
    claimDailyBonus,
    checkDailyBonus,
    getDailyBonusRewards,
    achievements,
    userStats,
    checkAchievements,
    getAchievementProgress,
    referralData,
    processReferral,
    addReferredUser,
    shareReferralCode,
    getReferralStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 