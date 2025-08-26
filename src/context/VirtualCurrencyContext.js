import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const VirtualCurrencyContext = createContext();

export const useVirtualCurrency = () => {
  const context = useContext(VirtualCurrencyContext);
  if (!context) {
    throw new Error('useVirtualCurrency must be used within VirtualCurrencyProvider');
  }
  return context;
};

export const VirtualCurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [coins, setCoins] = useState(1000); // Starting coins
  const [gems, setGems] = useState(0); // Premium currency
  const [dailyBonus, setDailyBonus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user's virtual currency balance
  useEffect(() => {
    if (user) {
      loadVirtualBalance();
      checkDailyBonus();
    }
  }, [user]);

  const loadVirtualBalance = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCoins(userData.virtualCoins || 1000);
        setGems(userData.virtualGems || 0);
      } else {
        // Initialize new user with starting currency
        await updateDoc(userRef, {
          virtualCoins: 1000,
          virtualGems: 0,
          lastLogin: new Date(),
          joinDate: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading virtual balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVirtualBalance = async (coinAmount = 0, gemAmount = 0, reason = 'unknown') => {
    try {
      const newCoins = Math.max(0, coins + coinAmount);
      const newGems = Math.max(0, gems + gemAmount);
      
      setCoins(newCoins);
      setGems(newGems);

      // Update in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        virtualCoins: newCoins,
        virtualGems: newGems,
        lastActivity: new Date()
      });

      // Log the transaction for tracking
      console.log(`Virtual currency updated: ${coinAmount} coins, ${gemAmount} gems. Reason: ${reason}`);
      
      return { coins: newCoins, gems: newGems };
    } catch (error) {
      console.error('Error updating virtual balance:', error);
      throw error;
    }
  };

  const placeBet = async (betAmount, gameType) => {
    if (betAmount > coins) {
      throw new Error('Insufficient coins! Earn more coins through daily bonuses or watch ads.');
    }

    try {
      await updateVirtualBalance(-betAmount, 0, `Bet placed on ${gameType}`);
      return true;
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  };

  const addWinnings = async (winAmount, gameType) => {
    try {
      await updateVirtualBalance(winAmount, 0, `Won ${winAmount} coins in ${gameType}`);
      return true;
    } catch (error) {
      console.error('Error adding winnings:', error);
      throw error;
    }
  };

  const checkDailyBonus = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastBonus = userData.lastDailyBonus?.toDate();
        const today = new Date();
        
        // Check if user can claim daily bonus (once per day)
        if (!lastBonus || lastBonus.toDateString() !== today.toDateString()) {
          setDailyBonus({
            available: true,
            amount: 500, // Daily bonus amount
            streak: userData.dailyBonusStreak || 0
          });
        } else {
          setDailyBonus({
            available: false,
            nextBonusIn: getTimeUntilNextDay()
          });
        }
      }
    } catch (error) {
      console.error('Error checking daily bonus:', error);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      const streak = (userData.dailyBonusStreak || 0) + 1;
      const bonusAmount = 500 + (streak * 50); // Bonus increases with streak
      
      await updateVirtualBalance(bonusAmount, 0, `Daily bonus - Day ${streak}`);
      
      await updateDoc(userRef, {
        lastDailyBonus: new Date(),
        dailyBonusStreak: streak
      });

      setDailyBonus({
        available: false,
        nextBonusIn: getTimeUntilNextDay()
      });

      return { amount: bonusAmount, streak };
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      throw error;
    }
  };

  const watchAdForCoins = async () => {
    // Simulate watching an ad for coins
    const adReward = 100;
    await updateVirtualBalance(adReward, 0, 'Watched advertisement');
    return adReward;
  };

  const purchaseGemPack = async (packType) => {
    // Simulate purchasing gems (this would integrate with real payment for gems only)
    const packs = {
      'small': { gems: 100, coins: 500 },
      'medium': { gems: 500, coins: 2500 },
      'large': { gems: 1000, coins: 5000 }
    };
    
    const pack = packs[packType];
    if (pack) {
      await updateVirtualBalance(pack.coins, pack.gems, `Purchased ${packType} gem pack`);
      return pack;
    }
  };

  const getTimeUntilNextDay = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - Date.now();
  };

  const value = {
    coins,
    gems,
    dailyBonus,
    loading,
    placeBet,
    addWinnings,
    updateVirtualBalance,
    claimDailyBonus,
    watchAdForCoins,
    purchaseGemPack,
    checkDailyBonus
  };

  return (
    <VirtualCurrencyContext.Provider value={value}>
      {children}
    </VirtualCurrencyContext.Provider>
  );
}; 