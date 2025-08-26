import { doc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const walletService = {
  // Check if user is banned
  async checkUserBanStatus(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.banned) {
          // Check if temporary ban has expired
          if (userData.banExpiresAt && userData.banExpiresAt.toDate() <= new Date()) {
            // Ban has expired, remove ban status
            await updateDoc(doc(db, 'users', userId), {
              banned: false,
              banReason: null,
              banExpiresAt: null,
              banDuration: null
            });
            
            return { isBanned: false };
          }
          
          return {
            isBanned: true,
            reason: userData.banReason,
            expiresAt: userData.banExpiresAt?.toDate(),
            isPermanent: !userData.banExpiresAt
          };
        }
      }
      
      return { isBanned: false };
    } catch (error) {
      console.error('Error checking ban status:', error);
      return { isBanned: false }; // Default to allowing access if check fails
    }
  },

  // Get user wallet balance
  async getWalletBalance(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().walletBalance;
      }
      return 0;
    } catch (error) {
      throw error;
    }
  },

  // Update wallet balance
  async updateWalletBalance(userId, amount, type, gameId = null, gameName = null) {
    try {
      console.log('updateWalletBalance called:', { userId, amount, type, gameId, gameName });
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentBalance = userDoc.data().walletBalance;
      const newBalance = currentBalance + amount;
      
      if (newBalance < 0) {
        throw new Error('Insufficient funds');
      }
      
      console.log('Updating wallet:', { currentBalance, newBalance });
      
      // Update wallet balance
      await updateDoc(userRef, {
        walletBalance: newBalance
      });
      
      // Record transaction
      const transactionData = {
        userId,
        amount,
        type, // 'bet', 'win', 'loss', 'deposit', 'withdrawal'
        previousBalance: currentBalance,
        newBalance,
        gameId,
        gameName,
        timestamp: new Date()
      };
      
      console.log('Recording transaction:', transactionData);
      
      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
      console.log('Transaction recorded with ID:', transactionRef.id);
      
      return newBalance;
    } catch (error) {
      console.error('Error in updateWalletBalance:', error);
      throw error;
    }
  },

  // Update game wallet balance
  async updateGameWalletBalance(userId, amount, type, gameId = null, gameName = null) {
    try {
      console.log('updateGameWalletBalance called:', { userId, amount, type, gameId, gameName });
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentBalance = userDoc.data().gameWalletBalance || 0;
      const newBalance = currentBalance + amount;
      
      if (newBalance < 0) {
        throw new Error('Insufficient game wallet funds');
      }
      
      console.log('Updating game wallet:', { currentBalance, newBalance });
      
      // Update game wallet balance
      await updateDoc(userRef, {
        gameWalletBalance: newBalance
      });
      
      // Record transaction
      const transactionData = {
        userId,
        amount,
        type,
        walletType: 'game_wallet',
        previousBalance: currentBalance,
        newBalance,
        gameId,
        gameName,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, 'transactions'), transactionData);
      
      return newBalance;
    } catch (error) {
      console.error('Error in updateGameWalletBalance:', error);
      throw error;
    }
  },

  // Update coins
  async updateCoins(userId, amount, type, gameId = null, gameName = null) {
    try {
      console.log('updateCoins called:', { userId, amount, type, gameId, gameName });
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentCoins = userDoc.data().coins || 0;
      const newCoins = currentCoins + amount;
      
      if (newCoins < 0) {
        throw new Error('Insufficient coins');
      }
      
      console.log('Updating coins:', { currentCoins, newCoins });
      
      // Update coins
      await updateDoc(userRef, {
        coins: newCoins
      });
      
      // Record transaction
      const transactionData = {
        userId,
        amount,
        type,
        walletType: 'coins',
        previousBalance: currentCoins,
        newBalance: newCoins,
        gameId,
        gameName,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, 'transactions'), transactionData);
      
      return newCoins;
    } catch (error) {
      console.error('Error in updateCoins:', error);
      throw error;
    }
  },

  // Update game wallet balance
  async updateGameWalletBalance(userId, amount, type, gameId = null, gameName = null) {
    try {
      console.log('updateGameWalletBalance called:', { userId, amount, type, gameId, gameName });
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentBalance = userDoc.data().gameWalletBalance || 0;
      const newBalance = currentBalance + amount;
      
      if (newBalance < 0) {
        throw new Error('Insufficient game wallet funds');
      }
      
      console.log('Updating game wallet:', { currentBalance, newBalance });
      
      // Update game wallet balance
      await updateDoc(userRef, {
        gameWalletBalance: newBalance
      });
      
      // Record transaction
      const transactionData = {
        userId,
        amount,
        type,
        walletType: 'game_wallet',
        previousBalance: currentBalance,
        newBalance,
        gameId,
        gameName,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, 'transactions'), transactionData);
      
      return newBalance;
    } catch (error) {
      console.error('Error in updateGameWalletBalance:', error);
      throw error;
    }
  },

  // Update coins
  async updateCoins(userId, amount, type, gameId = null, gameName = null) {
    try {
      console.log('updateCoins called:', { userId, amount, type, gameId, gameName });
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentCoins = userDoc.data().coins || 0;
      const newCoins = currentCoins + amount;
      
      if (newCoins < 0) {
        throw new Error('Insufficient coins');
      }
      
      console.log('Updating coins:', { currentCoins, newCoins });
      
      // Update coins
      await updateDoc(userRef, {
        coins: newCoins
      });
      
      // Record transaction
      const transactionData = {
        userId,
        amount,
        type,
        walletType: 'coins',
        previousBalance: currentCoins,
        newBalance: newCoins,
        gameId,
        gameName,
        timestamp: new Date()
      };
      
      await addDoc(collection(db, 'transactions'), transactionData);
      
      return newCoins;
    } catch (error) {
      console.error('Error in updateCoins:', error);
      throw error;
    }
  },

  // Place a bet
  async placeBet(userId, betAmount, gameId, gameName) {
    try {
      console.log('placeBet called:', { userId, betAmount, gameId, gameName });
      
      if (betAmount < 10 || betAmount > 1000) {
        throw new Error('Bet amount must be between ₹10 and ₹1000');
      }
      
      const newBalance = await this.updateWalletBalance(userId, -betAmount, 'bet', gameId, gameName);
      console.log('Bet placed successfully, new balance:', newBalance);
      return newBalance;
    } catch (error) {
      console.error('Error in placeBet:', error);
      throw error;
    }
  },

  // Process game result
  async processGameResult(userId, betAmount, multiplier, gameId, gameName, isWin) {
    try {
      console.log('processGameResult called:', { userId, betAmount, multiplier, gameId, gameName, isWin });
      
      if (isWin) {
        const winAmount = Math.floor(betAmount * multiplier);
        console.log('Processing win:', { winAmount, multiplier });
        const newBalance = await this.updateWalletBalance(userId, winAmount, 'win', gameId, gameName);
        return { newBalance, winAmount };
      } else {
        console.log('Processing loss - no additional transaction needed');
        // Loss is already deducted when bet was placed
        return { newBalance: await this.getWalletBalance(userId), winAmount: 0 };
      }
    } catch (error) {
      console.error('Error in processGameResult:', error);
      throw error;
    }
  },

  // Get transaction history
  async getTransactionHistory(userId, limit = 50) {
    try {
      console.log('getTransactionHistory called for user:', userId);
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        });
      });
      
      console.log('Found transactions:', transactions.length);
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Error in getTransactionHistory:', error);
      throw error;
    }
  },

  // Get game history
  async getGameHistory(userId, limit = 50) {
    try {
      console.log('getGameHistory called for user:', userId);
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('type', 'in', ['bet', 'win', 'loss']),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const games = [];
      
      querySnapshot.forEach((doc) => {
        games.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        });
      });
      
      console.log('Found game transactions:', games.length);
      return games.slice(0, limit);
    } catch (error) {
      console.error('Error in getGameHistory:', error);
      throw error;
    }
  }
}; 