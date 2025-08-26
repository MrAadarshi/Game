import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationHelper } from '../utils/notificationHelper';

const RewardsContext = createContext();

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};

export const RewardsProvider = ({ children }) => {
  const { user, updateWalletBalance } = useAuth();
  
  // Achievements System
  const [achievements, setAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  
  // Daily Challenges
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [challengeProgress, setChallengeProgress] = useState({});
  
  // Referral System
  const [referralStats, setReferralStats] = useState({
    code: '',
    totalReferrals: 0,
    totalEarnings: 0,
    tier: 'bronze',
    activeReferrals: []
  });
  
  // Social Features
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [socialShares, setSocialShares] = useState(0);

  // Initialize achievements list
  const initializeAchievements = () => {
    const achievementsList = [
      {
        id: 'first_win',
        title: 'First Victory! 🎉',
        description: 'Win your first game',
        icon: '🏆',
        reward: 100,
        category: 'gameplay',
        requirement: { type: 'wins', count: 1 }
      },
      {
        id: 'big_winner',
        title: 'Big Winner 💰',
        description: 'Win ₹1000 or more in a single game',
        icon: '💎',
        reward: 500,
        category: 'winnings',
        requirement: { type: 'single_win', amount: 1000 }
      },
      {
        id: 'daily_player',
        title: 'Daily Player 📅',
        description: 'Play for 7 consecutive days',
        icon: '🔥',
        reward: 750,
        category: 'streak',
        requirement: { type: 'daily_streak', count: 7 }
      },
      {
        id: 'game_explorer',
        title: 'Game Explorer 🎮',
        description: 'Play 5 different games',
        icon: '🗺️',
        reward: 300,
        category: 'exploration',
        requirement: { type: 'unique_games', count: 5 }
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly 🦋',
        description: 'Refer 3 friends successfully',
        icon: '👥',
        reward: 1500,
        category: 'social',
        requirement: { type: 'referrals', count: 3 }
      },
      {
        id: 'challenge_master',
        title: 'Challenge Master ⭐',
        description: 'Complete 10 daily challenges',
        icon: '🎯',
        reward: 1000,
        category: 'challenges',
        requirement: { type: 'challenges_completed', count: 10 }
      },
      {
        id: 'high_roller',
        title: 'High Roller 🎰',
        description: 'Place a bet of ₹500 or more',
        icon: '💸',
        reward: 200,
        category: 'betting',
        requirement: { type: 'high_bet', amount: 500 }
      },
      {
        id: 'lucky_seven',
        title: 'Lucky Seven 🍀',
        description: 'Win 7 games in a row',
        icon: '🎲',
        reward: 2000,
        category: 'streak',
        requirement: { type: 'win_streak', count: 7 }
      }
    ];
    
    setAchievements(achievementsList);
  };

  // Generate daily challenges
  const generateDailyChallenges = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`dailyChallenges_${today}`);
    
    if (stored) {
      const data = JSON.parse(stored);
      setDailyChallenges(data.challenges);
      setChallengeProgress(data.progress || {});
      return;
    }

    const challengeTemplates = [
      {
        id: 'play_games',
        title: 'Game Master',
        description: 'Play 5 games today',
        icon: '🎮',
        reward: 150,
        requirement: { type: 'games_played', count: 5 }
      },
      {
        id: 'win_games',
        title: 'Winner Winner',
        description: 'Win 3 games today',
        icon: '🏆',
        reward: 200,
        requirement: { type: 'games_won', count: 3 }
      },
      {
        id: 'earn_coins',
        title: 'Coin Collector',
        description: 'Earn ₹300 from games today',
        icon: '💰',
        reward: 100,
        requirement: { type: 'earnings', amount: 300 }
      },
      {
        id: 'try_new_game',
        title: 'Explorer',
        description: 'Try a new game you haven\'t played',
        icon: '🗺️',
        reward: 250,
        requirement: { type: 'new_game', count: 1 }
      },
      {
        id: 'social_share',
        title: 'Share the Fun',
        description: 'Share a win on social media',
        icon: '📱',
        reward: 75,
        requirement: { type: 'social_share', count: 1 }
      }
    ];

    // Select 3 random challenges for today
    const todaysChallenges = challengeTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((challenge, index) => ({
        ...challenge,
        id: `${challenge.id}_${Date.now()}_${index}`,
        progress: 0,
        completed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }));

    setDailyChallenges(todaysChallenges);
    setChallengeProgress({});
    
    localStorage.setItem(`dailyChallenges_${today}`, JSON.stringify({
      challenges: todaysChallenges,
      progress: {}
    }));
  };

  // Initialize referral system
  const initializeReferralSystem = () => {
    if (!user) return;

    const stored = localStorage.getItem(`referralStats_${user.uid || user.email}`);
    if (stored) {
      setReferralStats(JSON.parse(stored));
    } else {
      const newReferralCode = generateReferralCode();
      const initialStats = {
        code: newReferralCode,
        totalReferrals: 0,
        totalEarnings: 0,
        tier: 'bronze',
        activeReferrals: []
      };
      setReferralStats(initialStats);
      localStorage.setItem(`referralStats_${user.uid || user.email}`, JSON.stringify(initialStats));
    }
  };

  // Generate referral code
  const generateReferralCode = () => {
    const userId = user?.uid || user?.email || 'anonymous';
    const baseCode = userId.slice(-6) || Math.random().toString(36).slice(-6);
    return `GMS${baseCode.toUpperCase()}`;
  };

  // Add referral
  const addReferral = async (referredUserEmail) => {
    const newReferral = {
      email: referredUserEmail,
      joinedAt: new Date().toISOString(),
      status: 'active',
      earnings: 0
    };

    const updatedStats = {
      ...referralStats,
      totalReferrals: referralStats.totalReferrals + 1,
      totalEarnings: referralStats.totalEarnings + 100, // Referral bonus
      activeReferrals: [...referralStats.activeReferrals, newReferral]
    };

    // Update tier based on referrals
    if (updatedStats.totalReferrals >= 10) updatedStats.tier = 'platinum';
    else if (updatedStats.totalReferrals >= 5) updatedStats.tier = 'gold';
    else if (updatedStats.totalReferrals >= 2) updatedStats.tier = 'silver';

    setReferralStats(updatedStats);
    localStorage.setItem(`referralStats_${user.uid || user.email}`, JSON.stringify(updatedStats));
    
    // Add referral bonus to wallet
    await updateWalletBalance(100, 'referral_bonus', null, 'Referral');
    notificationHelper.showBonusNotification(100, 'referral');
    
    // Check for referral achievements
    checkAchievement('social_butterfly', { referrals: updatedStats.totalReferrals });
    
    return updatedStats;
  };

  // Update challenge progress
  const updateChallengeProgress = async (type, value = 1) => {
    const today = new Date().toDateString();
    const updatedChallenges = dailyChallenges.map(challenge => {
      if (challenge.requirement.type === type && !challenge.completed) {
        const newProgress = challenge.requirement.count ? 
          Math.min(challenge.progress + value, challenge.requirement.count) :
          challenge.progress + value;
        
        const isCompleted = challenge.requirement.count ? 
          newProgress >= challenge.requirement.count :
          newProgress >= challenge.requirement.amount;

        if (isCompleted && !challenge.completed) {
          // Challenge completed! Give reward
          updateWalletBalance(challenge.reward, 'challenge_reward', null, 'Daily Challenge');
          notificationHelper.showBonusNotification(challenge.reward, 'challenge');
          checkAchievement('challenge_master', { challenges_completed: 1 });
        }

        return {
          ...challenge,
          progress: newProgress,
          completed: isCompleted
        };
      }
      return challenge;
    });

    setDailyChallenges(updatedChallenges);
    localStorage.setItem(`dailyChallenges_${today}`, JSON.stringify({
      challenges: updatedChallenges,
      progress: challengeProgress
    }));
  };

  // Check and unlock achievements
  const checkAchievement = async (achievementId, progress) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || unlockedAchievements.includes(achievementId)) return;

    let unlocked = false;

    switch (achievement.requirement.type) {
      case 'wins':
        unlocked = progress.wins >= achievement.requirement.count;
        break;
      case 'single_win':
        unlocked = progress.amount >= achievement.requirement.amount;
        break;
      case 'referrals':
        unlocked = progress.referrals >= achievement.requirement.count;
        break;
      case 'challenges_completed':
        const currentCompleted = parseInt(localStorage.getItem('totalChallengesCompleted') || '0');
        const newTotal = currentCompleted + (progress.challenges_completed || 0);
        localStorage.setItem('totalChallengesCompleted', newTotal.toString());
        unlocked = newTotal >= achievement.requirement.count;
        break;
      default:
        break;
    }

    if (unlocked) {
      const newUnlocked = [...unlockedAchievements, achievementId];
      setUnlockedAchievements(newUnlocked);
      localStorage.setItem(`unlockedAchievements_${user?.uid || user?.email}`, JSON.stringify(newUnlocked));
      
      // Give achievement reward
      await updateWalletBalance(achievement.reward, 'achievement_reward', null, 'Achievement');
      notificationHelper.showBonusNotification(achievement.reward, 'achievement');
      
      // Show achievement notification
      notificationHelper.showAchievementNotification(achievement.title, achievement.reward);
    }
  };

  // Social sharing
  const shareWin = (gameType, amount) => {
    const shareText = `🎉 I just won ₹${amount} playing ${gameType} on GMS Gaming! Join me and get bonus rewards! Use my referral code: ${referralStats.code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Big Win on GMS Gaming!',
        text: shareText,
        url: window.location.origin
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    }
    
    setSocialShares(prev => prev + 1);
    updateChallengeProgress('social_share');
  };

  // Get referral tier benefits
  const getReferralTierBenefits = (tier) => {
    const benefits = {
      bronze: { bonus: 100, description: 'Basic referral bonus' },
      silver: { bonus: 150, description: '50% higher referral bonus + weekly bonus' },
      gold: { bonus: 200, description: '100% higher referral bonus + VIP support' },
      platinum: { bonus: 300, description: '200% higher referral bonus + exclusive games' }
    };
    return benefits[tier] || benefits.bronze;
  };

  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      initializeAchievements();
      generateDailyChallenges();
      initializeReferralSystem();
      
      // Load unlocked achievements
      const stored = localStorage.getItem(`unlockedAchievements_${user.uid || user.email}`);
      if (stored) {
        setUnlockedAchievements(JSON.parse(stored));
      }
    }
  }, [user]);

  const value = {
    // Achievements
    achievements,
    unlockedAchievements,
    checkAchievement,
    
    // Daily Challenges
    dailyChallenges,
    challengeProgress,
    updateChallengeProgress,
    generateDailyChallenges,
    
    // Referral System
    referralStats,
    addReferral,
    getReferralTierBenefits,
    
    // Social Features
    friends,
    leaderboard,
    socialShares,
    shareWin
  };

  return (
    <RewardsContext.Provider value={value}>
      {children}
    </RewardsContext.Provider>
  );
}; 