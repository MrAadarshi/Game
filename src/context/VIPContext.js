import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationHelper } from '../utils/notificationHelper';

const VIPContext = createContext();

export const useVIP = () => {
  const context = useContext(VIPContext);
  if (!context) {
    throw new Error('useVIP must be used within a VIPProvider');
  }
  return context;
};

export const VIPProvider = ({ children }) => {
  const { user, userStats, walletBalance } = useAuth();
  const [vipData, setVipData] = useState({
    currentTier: 'Bronze',
    currentPoints: 0,
    pointsToNextTier: 1000,
    lifetimePoints: 0,
    cashbackRate: 0.01,
    monthlyBonus: 0,
    claimedBonuses: []
  });

  const vipTiers = [
    {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      color: '#CD7F32',
      icon: '🥉',
      benefits: {
        cashbackRate: 0.01, // 1%
        monthlyBonus: 0,
        dailyBonusMultiplier: 1,
        tournamentAccess: ['Basic'],
        withdrawalLimit: 10000,
        supportPriority: 'Standard',
        personalManager: false,
        exclusiveGames: false
      },
      description: 'Entry level with basic rewards'
    },
    {
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 4999,
      color: '#C0C0C0',
      icon: '🥈',
      benefits: {
        cashbackRate: 0.015, // 1.5%
        monthlyBonus: 500,
        dailyBonusMultiplier: 1.2,
        tournamentAccess: ['Basic', 'Silver'],
        withdrawalLimit: 25000,
        supportPriority: 'Priority',
        personalManager: false,
        exclusiveGames: false
      },
      description: 'Enhanced rewards and priority support'
    },
    {
      name: 'Gold',
      minPoints: 5000,
      maxPoints: 14999,
      color: '#FFD700',
      icon: '🥇',
      benefits: {
        cashbackRate: 0.02, // 2%
        monthlyBonus: 1500,
        dailyBonusMultiplier: 1.5,
        tournamentAccess: ['Basic', 'Silver', 'Gold'],
        withdrawalLimit: 50000,
        supportPriority: 'High Priority',
        personalManager: false,
        exclusiveGames: true
      },
      description: 'Premium benefits and exclusive access'
    },
    {
      name: 'Platinum',
      minPoints: 15000,
      maxPoints: 49999,
      color: '#E5E4E2',
      icon: '💎',
      benefits: {
        cashbackRate: 0.025, // 2.5%
        monthlyBonus: 3000,
        dailyBonusMultiplier: 1.8,
        tournamentAccess: ['Basic', 'Silver', 'Gold', 'Platinum'],
        withdrawalLimit: 100000,
        supportPriority: 'VIP Priority',
        personalManager: true,
        exclusiveGames: true
      },
      description: 'VIP treatment with personal manager'
    },
    {
      name: 'Diamond',
      minPoints: 50000,
      maxPoints: Infinity,
      color: '#B9F2FF',
      icon: '💍',
      benefits: {
        cashbackRate: 0.03, // 3%
        monthlyBonus: 7500,
        dailyBonusMultiplier: 2.2,
        tournamentAccess: ['Basic', 'Silver', 'Gold', 'Platinum', 'Diamond'],
        withdrawalLimit: 250000,
        supportPriority: 'Instant VIP',
        personalManager: true,
        exclusiveGames: true
      },
      description: 'Ultimate VIP experience with maximum benefits'
    }
  ];

  useEffect(() => {
    if (user) {
      loadVIPData();
    }
  }, [user, userStats]);

  const loadVIPData = () => {
    const stored = localStorage.getItem('vipData');
    
    if (stored) {
      const storedData = JSON.parse(stored);
      
      // Calculate points based on user stats
      const totalWagered = userStats?.totalWagered || 0;
      const points = Math.floor(totalWagered / 10); // 1 point per ₹10 wagered
      
      const updatedData = {
        ...storedData,
        currentPoints: points,
        lifetimePoints: Math.max(storedData.lifetimePoints, points)
      };
      
      const currentTier = calculateTier(points);
      const pointsToNext = calculatePointsToNextTier(points);
      
      setVipData({
        ...updatedData,
        currentTier: currentTier.name,
        pointsToNextTier: pointsToNext,
        cashbackRate: currentTier.benefits.cashbackRate,
        monthlyBonus: currentTier.benefits.monthlyBonus
      });
    } else {
      // Initialize new VIP data
      const totalWagered = userStats?.totalWagered || 0;
      const points = Math.floor(totalWagered / 10);
      const currentTier = calculateTier(points);
      const pointsToNext = calculatePointsToNextTier(points);
      
      const newVipData = {
        currentTier: currentTier.name,
        currentPoints: points,
        pointsToNextTier: pointsToNext,
        lifetimePoints: points,
        cashbackRate: currentTier.benefits.cashbackRate,
        monthlyBonus: currentTier.benefits.monthlyBonus,
        claimedBonuses: []
      };
      
      setVipData(newVipData);
      localStorage.setItem('vipData', JSON.stringify(newVipData));
    }
  };

  const calculateTier = (points) => {
    for (let i = vipTiers.length - 1; i >= 0; i--) {
      if (points >= vipTiers[i].minPoints) {
        return vipTiers[i];
      }
    }
    return vipTiers[0]; // Default to Bronze
  };

  const calculatePointsToNextTier = (points) => {
    const currentTier = calculateTier(points);
    const currentTierIndex = vipTiers.findIndex(tier => tier.name === currentTier.name);
    
    if (currentTierIndex < vipTiers.length - 1) {
      const nextTier = vipTiers[currentTierIndex + 1];
      return nextTier.minPoints - points;
    }
    
    return 0; // Already at max tier
  };

  const checkTierUpgrade = (newPoints) => {
    const oldTier = calculateTier(vipData.currentPoints);
    const newTier = calculateTier(newPoints);
    
    if (newTier.name !== oldTier.name) {
      // Tier upgrade!
      notificationHelper.showInAppNotification(
        '🎉 VIP Tier Upgrade!',
        `Congratulations! You've been promoted to ${newTier.name} tier!`,
        'achievement',
        8000,
        {
          label: 'View Benefits',
          callback: () => {
            // Navigate to VIP page
            window.location.href = '/vip';
          }
        }
      );
      
      // Award tier upgrade bonus
      const upgradeBonus = newTier.minPoints * 0.1; // 10% of minimum points as bonus
      notificationHelper.showBonusNotification(upgradeBonus, 'tier-upgrade');
    }
  };

  const claimMonthlyBonus = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const bonusKey = `${currentYear}-${currentMonth}`;
    
    if (vipData.claimedBonuses.includes(bonusKey)) {
      notificationHelper.showErrorNotification('Monthly bonus already claimed for this month.');
      return false;
    }
    
    if (vipData.monthlyBonus === 0) {
      notificationHelper.showErrorNotification('No monthly bonus available for your current tier.');
      return false;
    }
    
    // Add bonus to wallet (this would normally update through auth context)
    const updatedVipData = {
      ...vipData,
      claimedBonuses: [...vipData.claimedBonuses, bonusKey]
    };
    
    setVipData(updatedVipData);
    localStorage.setItem('vipData', JSON.stringify(updatedVipData));
    
    notificationHelper.showBonusNotification(vipData.monthlyBonus, 'monthly-vip');
    
    return true;
  };

  const getCashback = (lossAmount) => {
    const cashback = Math.floor(lossAmount * vipData.cashbackRate);
    if (cashback > 0) {
      notificationHelper.showBonusNotification(cashback, 'cashback');
    }
    return cashback;
  };

  const getVIPBenefits = () => {
    const currentTier = vipTiers.find(tier => tier.name === vipData.currentTier);
    return currentTier ? currentTier.benefits : vipTiers[0].benefits;
  };

  const getProgressToNextTier = () => {
    const currentTierIndex = vipTiers.findIndex(tier => tier.name === vipData.currentTier);
    
    if (currentTierIndex < vipTiers.length - 1) {
      const nextTier = vipTiers[currentTierIndex + 1];
      const progress = ((vipData.currentPoints - vipTiers[currentTierIndex].minPoints) / 
                      (nextTier.minPoints - vipTiers[currentTierIndex].minPoints)) * 100;
      
      return {
        progress: Math.min(100, Math.max(0, progress)),
        nextTier: nextTier.name,
        pointsNeeded: vipData.pointsToNextTier
      };
    }
    
    return {
      progress: 100,
      nextTier: 'Max Tier',
      pointsNeeded: 0
    };
  };

  const canClaimMonthlyBonus = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const bonusKey = `${currentYear}-${currentMonth}`;
    
    return !vipData.claimedBonuses.includes(bonusKey) && vipData.monthlyBonus > 0;
  };

  const getVIPStats = () => {
    const currentTier = vipTiers.find(tier => tier.name === vipData.currentTier);
    const progressInfo = getProgressToNextTier();
    
    return {
      currentTier: currentTier,
      currentPoints: vipData.currentPoints,
      lifetimePoints: vipData.lifetimePoints,
      progressToNext: progressInfo,
      benefits: getVIPBenefits(),
      canClaimBonus: canClaimMonthlyBonus(),
      monthlyBonus: vipData.monthlyBonus
    };
  };

  const value = {
    vipData,
    vipTiers,
    claimMonthlyBonus,
    getCashback,
    getVIPBenefits,
    getProgressToNextTier,
    getVIPStats,
    canClaimMonthlyBonus,
    checkTierUpgrade
  };

  return (
    <VIPContext.Provider value={value}>
      {children}
    </VIPContext.Provider>
  );
};

export default VIPContext; 