import { doc, getDoc, updateDoc, setDoc, collection, query, where, orderBy, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Primary Admin Emails - Only these emails can access admin panel
const ADMIN_EMAILS = [
  "vishal@admin.com" // Primary admin
];

export const adminService = {
  // Check if user is admin - SECURE VERSION
  async isAdmin(userEmail) {
    try {
      if (!userEmail) {
        console.log('🔍 No user email provided');
        return false;
      }
      
      console.log('🔍 Checking admin status for email:', userEmail);
      
      // Check if email is in the admin list
      if (ADMIN_EMAILS.includes(userEmail)) {
        console.log('✅ Admin access granted - email in ADMIN_EMAILS');
        return true;
      }
      
      // Check if user has admin role in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'admins', userEmail));
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          console.log('✅ Admin access granted - found in Firestore admins collection');
          return true;
        }
      } catch (firestoreError) {
        console.log('⚠️ Could not check Firestore admin status:', firestoreError.message);
      }
      
      console.log('❌ Admin access denied for:', userEmail);
      return false;
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  },

  // Add a new admin (only existing admins can do this)
  async addAdmin(newAdminEmail, currentAdminEmail) {
    try {
      // Verify current user is admin
      const isCurrentUserAdmin = await this.isAdmin(currentAdminEmail);
      if (!isCurrentUserAdmin) {
        throw new Error('Only admins can add other admins');
      }

      // Add to Firestore admins collection
      await setDoc(doc(db, 'admins', newAdminEmail), {
        email: newAdminEmail,
        isAdmin: true,
        addedBy: currentAdminEmail,
        addedAt: serverTimestamp(),
        permissions: {
          userManagement: true,
          gameManagement: true,
          paymentManagement: true,
          systemSettings: true
        }
      });

      // Log the action
      await addDoc(collection(db, 'admin_logs'), {
        action: 'admin_added',
        targetEmail: newAdminEmail,
        performedBy: currentAdminEmail,
        timestamp: serverTimestamp(),
        details: `Added ${newAdminEmail} as admin`
      });

      console.log('✅ Admin added successfully:', newAdminEmail);
      return { success: true, message: 'Admin added successfully' };
    } catch (error) {
      console.error('❌ Error adding admin:', error);
      throw error;
    }
  },

  // Remove admin access (only primary admin can do this)
  async removeAdmin(targetAdminEmail, currentAdminEmail) {
    try {
      // Only primary admin can remove other admins
      if (currentAdminEmail !== ADMIN_EMAILS[0]) {
        throw new Error('Only the primary admin can remove other admins');
      }

      // Cannot remove primary admin
      if (targetAdminEmail === ADMIN_EMAILS[0]) {
        throw new Error('Cannot remove primary admin');
      }

      // Remove from Firestore
      await updateDoc(doc(db, 'admins', targetAdminEmail), {
        isAdmin: false,
        removedBy: currentAdminEmail,
        removedAt: serverTimestamp()
      });

      // Log the action
      await addDoc(collection(db, 'admin_logs'), {
        action: 'admin_removed',
        targetEmail: targetAdminEmail,
        performedBy: currentAdminEmail,
        timestamp: serverTimestamp(),
        details: `Removed ${targetAdminEmail} from admin role`
      });

      console.log('✅ Admin removed successfully:', targetAdminEmail);
      return { success: true, message: 'Admin removed successfully' };
    } catch (error) {
      console.error('❌ Error removing admin:', error);
      throw error;
    }
  },

  // Get all admins (for admin management)
  async getAllAdmins() {
    try {
      const adminsQuery = query(
        collection(db, 'admins'),
        where('isAdmin', '==', true),
        orderBy('addedAt', 'desc')
      );
      
      const adminsSnapshot = await getDocs(adminsQuery);
      const firebaseAdmins = adminsSnapshot.docs.map(doc => ({
        email: doc.id,
        ...doc.data()
      }));

      // Combine with hardcoded primary admins
      const allAdmins = [
        ...ADMIN_EMAILS.map(email => ({
          email,
          isPrimary: true,
          addedAt: 'System',
          permissions: { userManagement: true, gameManagement: true, paymentManagement: true, systemSettings: true }
        })),
        ...firebaseAdmins.filter(admin => !ADMIN_EMAILS.includes(admin.email))
      ];

      return allAdmins;
    } catch (error) {
      console.error('Error getting all admins:', error);
      return ADMIN_EMAILS.map(email => ({ email, isPrimary: true }));
    }
  },

  // Get all users
  async getAllUsers(limitCount = 100) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          // Ensure createdAt is properly handled
          createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
          lastLogin: data.lastLogin?.toDate?.() || data.lastLogin || null
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return { 
          id: userDoc.id, 
          ...data,
          // Ensure createdAt is properly handled
          createdAt: data.createdAt?.toDate?.() || data.createdAt || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role });
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Adjust user balance manually
  async adjustUserBalance(userId, amount, reason, adminId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentBalance = userDoc.data().walletBalance || 0;
      const newBalance = Math.max(0, currentBalance + amount);
      
      // Update user's wallet balance
      await updateDoc(userRef, {
        walletBalance: newBalance
      });
      
      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId,
        amount,
        type: amount > 0 ? 'admin_credit' : 'admin_debit',
        reason,
        adminId,
        timestamp: serverTimestamp(),
        previousBalance: currentBalance,
        newBalance
      });
      
      // Log admin action
      await addDoc(collection(db, 'admin_logs'), {
        action: 'balance_adjustment',
        userId,
        amount,
        reason,
        adminId,
        timestamp: serverTimestamp(),
        previousBalance: currentBalance,
        newBalance
      });
      
      return { success: true, newBalance };
    } catch (error) {
      console.error('Error adjusting user balance:', error);
      throw error;
    }
  },

  // Get detailed user information with statistics - ROBUST VERSION
  async getUserDetails(userId) {
    try {
      console.log('🔍 Getting user details for:', userId);
      
      // Get user basic info
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.error('❌ User not found:', userId);
        throw new Error(`User with ID ${userId} not found`);
      }
      
      const userData = userDoc.data();
      console.log('✅ User data loaded:', userData.email);
      
      // Initialize with defaults
      let transactions = [];
      let paymentRequests = [];
      let gameStats = {};
      let financialSummary = {
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalWagered: 0,
        totalWon: 0,
        totalLost: 0,
        netProfit: 0,
        depositCount: 0,
        withdrawalCount: 0,
        betCount: 0,
        winCount: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageTransactionAmount: 0
      };

      // Try to get user transactions (with fallback)
      try {
        console.log('🔍 Loading transactions...');
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', userId),
          limit(100)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        transactions = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure timestamp is properly handled
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp || new Date()
        }));
        console.log('✅ Transactions loaded:', transactions.length);
        
        // Calculate statistics from transactions
        gameStats = this.calculateUserGameStats(transactions);
        financialSummary = this.calculateFinancialSummary(transactions);
      } catch (transactionError) {
        console.warn('⚠️ Could not load transactions:', transactionError.message);
        // Continue with empty transactions - not critical
      }

      // Try to get payment requests (with fallback)
      try {
        console.log('🔍 Loading payment requests...');
        const paymentRequestsQuery = query(
          collection(db, 'payment_requests'),
          where('userId', '==', userId),
          limit(50)
        );
        
        const paymentRequestsSnapshot = await getDocs(paymentRequestsQuery);
        paymentRequests = paymentRequestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure timestamp is properly handled
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp || new Date()
        }));
        console.log('✅ Payment requests loaded:', paymentRequests.length);
      } catch (paymentError) {
        console.warn('⚠️ Could not load payment requests:', paymentError.message);
        // Continue with empty payment requests - not critical
      }
      
      const result = {
        ...userData,
        id: userId,
        email: userData.email,
        name: userData.name || userData.username || 'User',
        walletBalance: userData.walletBalance || 0,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
        banned: userData.banned || false,
        banReason: userData.banReason || null,
        transactions: transactions.slice(0, 50), // Limit display to recent 50
        paymentRequests,
        gameStatistics: gameStats,
        financialSummary
      };
      
      console.log('✅ User details compiled successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting user details:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        userId
      });
      
      // Provide more specific error messages
      if (error.message.includes('not found')) {
        throw new Error(`User ${userId} not found in database`);
      } else if (error.message.includes('permission-denied')) {
        throw new Error('Permission denied. Admin access required.');
      } else if (error.message.includes('unavailable')) {
        throw new Error('Database temporarily unavailable. Please try again.');
      } else {
        throw new Error(`Failed to load user details: ${error.message}`);
      }
    }
  },

  // Calculate detailed game statistics for a user - ROBUST VERSION
  calculateUserGameStats(transactions = []) {
    try {
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return {};
      }

      const gameStats = {};
      const betTransactions = transactions.filter(t => t && t.type === 'bet');
      const winTransactions = transactions.filter(t => t && t.type === 'win');

      // Group by game
      betTransactions.forEach(bet => {
        try {
          const gameName = bet.gameName || 'Unknown Game';
          if (!gameStats[gameName]) {
            gameStats[gameName] = {
              totalBets: 0,
              totalWagered: 0,
              totalWins: 0,
              totalWon: 0,
              biggestWin: 0,
              lastPlayed: null,
              averageBet: 0,
              winRate: 0,
              netResult: 0
            };
          }
          
          const betAmount = Math.abs(bet.amount || 0);
          gameStats[gameName].totalBets += 1;
          gameStats[gameName].totalWagered += betAmount;
          gameStats[gameName].lastPlayed = bet.timestamp || new Date();
        } catch (error) {
          console.warn('Error processing bet transaction:', error);
        }
      });

      winTransactions.forEach(win => {
        try {
          const gameName = win.gameName || 'Unknown Game';
          if (gameStats[gameName]) {
            const winAmount = win.amount || 0;
            gameStats[gameName].totalWins += 1;
            gameStats[gameName].totalWon += winAmount;
            gameStats[gameName].biggestWin = Math.max(gameStats[gameName].biggestWin, winAmount);
          }
        } catch (error) {
          console.warn('Error processing win transaction:', error);
        }
      });

      // Calculate derived stats
      Object.keys(gameStats).forEach(gameName => {
        try {
          const stats = gameStats[gameName];
          stats.averageBet = stats.totalBets > 0 ? Math.round(stats.totalWagered / stats.totalBets) : 0;
          stats.winRate = stats.totalBets > 0 ? Math.round((stats.totalWins / stats.totalBets) * 100 * 100) / 100 : 0;
          stats.netResult = stats.totalWon - stats.totalWagered;
        } catch (error) {
          console.warn('Error calculating derived stats for', gameName, error);
        }
      });

      return gameStats;
    } catch (error) {
      console.error('Error calculating game stats:', error);
      return {};
    }
  },

  // Calculate financial summary - ROBUST VERSION
  calculateFinancialSummary(transactions = []) {
    try {
      const summary = {
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalWagered: 0,
        totalWon: 0,
        totalLost: 0,
        netProfit: 0,
        depositCount: 0,
        withdrawalCount: 0,
        betCount: 0,
        winCount: 0,
        biggestWin: 0,
        biggestLoss: 0,
        firstTransaction: null,
        lastTransaction: null,
        averageTransactionAmount: 0
      };

      if (!Array.isArray(transactions) || transactions.length === 0) {
        return summary;
      }

      transactions.forEach(transaction => {
        try {
          if (!transaction || typeof transaction.amount === 'undefined') {
            return;
          }

          const amount = Math.abs(transaction.amount || 0);
          const timestamp = transaction.timestamp || new Date();
          
          switch (transaction.type) {
            case 'deposit':
            case 'deposit_approved':
            case 'admin_credit':
              summary.totalDeposited += amount;
              summary.depositCount += 1;
              break;
            case 'withdrawal':
            case 'withdrawal_approved':
            case 'admin_debit':
              summary.totalWithdrawn += amount;
              summary.withdrawalCount += 1;
              break;
            case 'bet':
              summary.totalWagered += amount;
              summary.betCount += 1;
              summary.biggestLoss = Math.max(summary.biggestLoss, amount);
              break;
            case 'win':
              summary.totalWon += amount;
              summary.winCount += 1;
              summary.biggestWin = Math.max(summary.biggestWin, amount);
              break;
            default:
              // Handle other transaction types
              break;
          }

          // Track first and last transactions
          if (!summary.firstTransaction || timestamp < summary.firstTransaction) {
            summary.firstTransaction = timestamp;
          }
          if (!summary.lastTransaction || timestamp > summary.lastTransaction) {
            summary.lastTransaction = timestamp;
          }
        } catch (transactionError) {
          console.warn('Error processing transaction in summary:', transactionError);
        }
      });

      // Calculate derived values safely
      summary.totalLost = Math.max(0, summary.totalWagered - summary.totalWon);
      summary.netProfit = summary.totalWon - summary.totalWagered + summary.totalDeposited - summary.totalWithdrawn;
      summary.averageTransactionAmount = transactions.length > 0 ? 
        Math.round(transactions.reduce((sum, t) => sum + Math.abs(t?.amount || 0), 0) / transactions.length) : 0;

      return summary;
    } catch (error) {
      console.error('Error calculating financial summary:', error);
      return {
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalWagered: 0,
        totalWon: 0,
        totalLost: 0,
        netProfit: 0,
        depositCount: 0,
        withdrawalCount: 0,
        betCount: 0,
        winCount: 0,
        biggestWin: 0,
        biggestLoss: 0,
        firstTransaction: null,
        lastTransaction: null,
        averageTransactionAmount: 0
      };
    }
  },

  // Search users by email, username, or ID - OPTIMIZED
  async searchUsers(searchTerm, limitCount = 20) {
    try {
      console.log('🔍 AdminService: Searching for:', searchTerm);
      const searchLower = searchTerm.toLowerCase();
      
      // Multiple targeted queries for better performance
      const searchPromises = [];
      
      // Search by email (most common search)
      if (searchTerm.includes('@') || searchTerm.includes('.')) {
        searchPromises.push(
          getDocs(query(
            collection(db, 'users'),
            orderBy('email'),
            limit(50)
          ))
        );
      }
      
      // Search recent users (for ID or username searches)
      searchPromises.push(
        getDocs(query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(100)
        ))
      );
      
      const results = await Promise.all(searchPromises);
      const allUsers = new Map(); // Use Map to avoid duplicates
      
      // Combine results from all queries
      results.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          if (!allUsers.has(doc.id)) {
            allUsers.set(doc.id, {
          id: doc.id,
              ...doc.data()
            });
          }
        });
      });
      
      // Filter and sort by relevance
      const filteredUsers = Array.from(allUsers.values())
        .filter(user => {
          const email = user.email?.toLowerCase() || '';
          const username = user.name?.toLowerCase() || user.username?.toLowerCase() || '';
          const id = user.id.toLowerCase();
          
          return email.includes(searchLower) || 
                 username.includes(searchLower) || 
                 id.includes(searchLower);
        })
        .sort((a, b) => {
          // Sort by relevance - exact matches first
          const aEmail = a.email?.toLowerCase() || '';
          const bEmail = b.email?.toLowerCase() || '';
          
          if (aEmail.startsWith(searchLower)) return -1;
          if (bEmail.startsWith(searchLower)) return 1;
          
          return b.createdAt?.toDate?.() - a.createdAt?.toDate?.() || 0;
        })
        .slice(0, limitCount);
      
      console.log('🔍 AdminService: Found', filteredUsers.length, 'users');
      return filteredUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      
      // Fallback to simple search if optimized search fails
      try {
        const fallbackQuery = query(
          collection(db, 'users'),
          limit(50)
        );
        const snapshot = await getDocs(fallbackQuery);
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(user => 
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, limitCount);
        
        console.log('🔍 AdminService: Fallback search found', users.length, 'users');
        return users;
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return [];
      }
    }
  },

  // Create demo user for testing
  async createDemoUser(userData) {
    try {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        ...userData,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin
      });

      // Create some demo transactions for this user
      const userId = userRef.id;
      const demoTransactions = [
        {
          userId,
          amount: -100,
          type: 'bet',
          gameName: 'Flip Coin',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          previousBalance: userData.walletBalance + 100,
          newBalance: userData.walletBalance
        },
        {
        userId,
          amount: 200,
          type: 'win',
          gameName: 'Flip Coin',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000),
          previousBalance: userData.walletBalance,
          newBalance: userData.walletBalance + 200
        },
        {
          userId,
          amount: 1000,
          type: 'deposit',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          previousBalance: userData.walletBalance - 1000,
          newBalance: userData.walletBalance
        }
      ];

      for (const transaction of demoTransactions) {
        await addDoc(collection(db, 'transactions'), transaction);
      }

      return userId;
    } catch (error) {
      console.error('Error creating demo user:', error);
      throw error;
    }
  },

  // Ban/Unban user with enhanced options
  async toggleUserBan(userId, banned, reason, adminId, duration = null) {
    try {
      const userRef = doc(db, 'users', userId);
      
      const updateData = {
        banned,
        banReason: banned ? reason : null,
        bannedBy: banned ? adminId : null,
        bannedAt: banned ? serverTimestamp() : null,
        unbannedAt: !banned ? serverTimestamp() : null
      };

      // Add ban duration if specified
      if (banned && duration) {
        const banExpiresAt = new Date();
        banExpiresAt.setDate(banExpiresAt.getDate() + parseInt(duration));
        updateData.banDuration = parseInt(duration);
        updateData.banExpiresAt = banExpiresAt;
      }

      await updateDoc(userRef, updateData);
      
      // Log the action
      await addDoc(collection(db, 'admin_logs'), {
        action: banned ? 'user_banned' : 'user_unbanned',
        userId,
        reason,
        duration: duration || null,
        adminId,
        timestamp: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error toggling user ban:', error);
      throw error;
    }
  },

  // Create a new payment request
  async createPaymentRequest(requestData) {
    try {
      console.log('💾 Creating payment request:', requestData);
      
      const paymentRequest = {
        ...requestData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'payment_requests'), paymentRequest);
      console.log('✅ Payment request created with ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id,
        ...paymentRequest
      };
    } catch (error) {
      console.error('❌ Error creating payment request:', error);
      throw error;
    }
  },

  // Get all payment requests
  async getAllPaymentRequests() {
    try {
      const paymentRequestsQuery = query(
        collection(db, 'payment_requests'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const paymentRequestsSnapshot = await getDocs(paymentRequestsQuery);
      const paymentRequests = paymentRequestsSnapshot.docs.map(doc => ({
          id: doc.id,
        ...doc.data()
      }));
      
      return paymentRequests;
    } catch (error) {
      console.error('Error getting payment requests:', error);
      return [];
    }
  },

  // Process payment request
  async processPaymentRequest(requestId, action, request) {
    try {
      console.log('🔄 Processing payment request:', { requestId, action, requestType: request.type, amount: request.amount, userId: request.userId });
      
      const requestRef = doc(db, 'payment_requests', requestId);
      
      if (action === 'approve') {
        console.log('✅ Approving payment request...');
      
      // Update request status
      await updateDoc(requestRef, {
          status: 'approved',
        processedAt: serverTimestamp()
      });
        console.log('✅ Request status updated to approved');
      
        if (request.type === 'deposit_request') {
          console.log('💰 Processing deposit approval - adding funds to wallet...');
          // Add money to user's wallet
          const newBalance = await this.updateUserWallet(request.userId, request.amount, 'deposit_approved');
          console.log('✅ Deposit approved! New wallet balance:', newBalance);
        } else if (request.type === 'withdrawal_request') {
          // Money already deducted, just record the approval
          await addDoc(collection(db, 'transactions'), {
            userId: request.userId,
            amount: 0, // Amount already deducted
            originalAmount: request.amount,
            type: 'withdrawal_approved',
            timestamp: serverTimestamp(),
            requestId
          });
        }
      } else if (action === 'reject') {
        // Update request status
        await updateDoc(requestRef, {
          status: 'rejected',
          processedAt: serverTimestamp()
        });

        if (request.type === 'withdrawal_request') {
          // Refund the money to user's wallet
          await this.updateUserWallet(request.userId, request.amount, 'withdrawal_refund');
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error processing payment request:', error);
      throw error;
    }
  },

  // Update user wallet helper
  async updateUserWallet(userId, amount, type) {
    try {
      console.log('💳 Updating user wallet:', { userId, amount, type });
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('❌ User not found:', userId);
        throw new Error('User not found');
      }
      
      const currentBalance = userDoc.data().walletBalance || 0;
      const newBalance = Math.max(0, currentBalance + amount);
      
      console.log('💳 Wallet update details:', {
        userId,
        currentBalance,
        amount,
        newBalance,
        type
      });
      
      // Update user's wallet balance
      await updateDoc(userRef, {
        walletBalance: newBalance
      });
      console.log('✅ User wallet balance updated successfully');
      
      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId,
        amount,
        type,
        timestamp: serverTimestamp(),
        previousBalance: currentBalance,
        newBalance
      });
      console.log('✅ Transaction recorded successfully');
      
      return newBalance;
    } catch (error) {
      console.error('Error updating user wallet:', error);
      throw error;
    }
  },

  // Game Management Functions
  async getAllGames() {
    try {
      console.log('🎮 Getting all games...');
      
      // Default games configuration - return immediately if Firebase fails
      const defaultGamesConfig = [
        { id: 'flip-coin', name: 'Flip Coin', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'dice-roll', name: 'Dice Roll', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'card-match', name: 'Card Match', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'color-prediction', name: 'Color Prediction', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'roulette', name: 'Roulette', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'slot-machine', name: 'Slot Machine', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'lucky-wheel', name: 'Lucky Wheel', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'mines', name: 'Mines', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'plinko', name: 'Plinko', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'andar-bahar', name: 'Andar Bahar', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'number-guessing', name: 'Number Guessing', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'jackpot', name: 'Jackpot', enabled: true, maxBet: 10000, minBet: 10 },
        { id: 'fly-rocket', name: 'Fly Rocket', enabled: true, maxBet: 10000, minBet: 10 }
      ];

      let gamesConfig = defaultGamesConfig;
      
      try {
        // Try to get games configuration from Firebase with timeout
        const gamesRef = doc(db, 'settings', 'games');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase timeout')), 3000)
        );
        const gamesPromise = getDoc(gamesRef);
        
        const gamesDoc = await Promise.race([gamesPromise, timeoutPromise]);
        
        if (gamesDoc.exists()) {
          gamesConfig = gamesDoc.data().games || defaultGamesConfig;
          console.log('🎮 Loaded games from Firebase');
        } else {
          console.log('🎮 Games config not found, creating default...');
          // Initialize games config in Firebase (non-blocking)
          setDoc(gamesRef, { games: defaultGamesConfig }).catch(err => 
            console.log('Could not save default games config:', err)
          );
        }
      } catch (error) {
        console.log('🎮 Firebase failed, using defaults:', error.message);
        gamesConfig = defaultGamesConfig;
      }
      
      // Get game statistics with fallback
      let gameStats = {};
      try {
        gameStats = await Promise.race([
          this.getGameStatistics(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Stats timeout')), 2000))
        ]);
        console.log('🎮 Loaded game statistics');
      } catch (error) {
        console.log('🎮 Stats failed, using defaults:', error.message);
        gameStats = {};
      }
      
      // Merge config with statistics
      const result = gamesConfig.map(game => ({
        ...game,
        stats: gameStats[game.id] || {
          totalBets: 0,
          totalRevenue: 0,
          totalPlayers: 0,
          averageBet: 0
        }
      }));
      
      console.log('🎮 All games ready:', result.length);
      return result;
    } catch (error) {
      console.error('Error getting all games:', error);
      // Return default games even if everything fails
      return [
        { id: 'flip-coin', name: 'Flip Coin', enabled: true, maxBet: 10000, minBet: 10, stats: { totalBets: 0, totalRevenue: 0, totalPlayers: 0, averageBet: 0 } },
        { id: 'dice-roll', name: 'Dice Roll', enabled: true, maxBet: 10000, minBet: 10, stats: { totalBets: 0, totalRevenue: 0, totalPlayers: 0, averageBet: 0 } },
        { id: 'card-match', name: 'Card Match', enabled: true, maxBet: 10000, minBet: 10, stats: { totalBets: 0, totalRevenue: 0, totalPlayers: 0, averageBet: 0 } }
      ];
    }
  },

  async updateGameStatus(gameId, enabled, adminId) {
    try {
      const gamesRef = doc(db, 'settings', 'games');
      const gamesDoc = await getDoc(gamesRef);
      
      if (gamesDoc.exists()) {
        const currentGames = gamesDoc.data().games;
        const updatedGames = currentGames.map(game => 
          game.id === gameId ? { ...game, enabled } : game
        );
        
        await updateDoc(gamesRef, { games: updatedGames });
      }
      
      // Log the action
      await addDoc(collection(db, 'admin_logs'), {
        action: 'game_status_updated',
        gameId,
        enabled,
        adminId,
        timestamp: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating game status:', error);
      throw error;
    }
  },

  async updateGameLimits(gameId, maxBet, minBet, adminId) {
    try {
      const gamesRef = doc(db, 'settings', 'games');
      const gamesDoc = await getDoc(gamesRef);
      
      if (gamesDoc.exists()) {
        const currentGames = gamesDoc.data().games;
        const updatedGames = currentGames.map(game => 
          game.id === gameId ? { ...game, maxBet, minBet } : game
        );
        
        await updateDoc(gamesRef, { games: updatedGames });
      }
      
      // Log the action
      await addDoc(collection(db, 'admin_logs'), {
        action: 'game_limits_updated',
        gameId,
        maxBet,
        minBet,
        adminId,
        timestamp: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating game limits:', error);
      throw error;
    }
  },

  // Get game statistics
  async getGameStatistics() {
    try {
      // Get all transactions related to games
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('type', 'in', ['bet', 'win']),
        limit(1000)
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => doc.data());
      
      const gameStats = {};
      
      transactions.forEach(transaction => {
        const gameName = transaction.gameName || 'unknown';
        const gameId = this.getGameIdFromName(gameName);
        
        if (!gameStats[gameId]) {
          gameStats[gameId] = {
            totalBets: 0,
            totalRevenue: 0,
            totalPlayers: new Set(),
            averageBet: 0
          };
        }
        
        if (transaction.type === 'bet') {
          gameStats[gameId].totalBets += 1;
          gameStats[gameId].totalRevenue += Math.abs(transaction.amount);
          gameStats[gameId].totalPlayers.add(transaction.userId);
        }
      });
      
      // Convert Set to count and calculate averages
      Object.keys(gameStats).forEach(gameId => {
        const stats = gameStats[gameId];
        stats.totalPlayers = stats.totalPlayers.size;
        stats.averageBet = stats.totalBets > 0 ? stats.totalRevenue / stats.totalBets : 0;
      });
      
      return gameStats;
    } catch (error) {
      console.error('Error getting game statistics:', error);
      return {};
    }
  },

  // Helper function to convert game name to ID
  getGameIdFromName(gameName) {
    const nameToIdMap = {
      'Flip Coin': 'flip-coin',
      'Dice Roll': 'dice-roll',
      'Card Match': 'card-match',
      'Color Prediction': 'color-prediction',
      'Roulette': 'roulette',
      'Slot Machine': 'slot-machine',
      'Lucky Wheel': 'lucky-wheel',
      'Mines': 'mines',
      'Plinko': 'plinko',
      'Andar Bahar': 'andar-bahar',
      'Number Guessing': 'number-guessing',
      'Jackpot': 'jackpot',
      'Fly Rocket': 'fly-rocket'
    };
    
    return nameToIdMap[gameName] || gameName.toLowerCase().replace(/\s+/g, '-');
  },

  // Platform Settings
  async getPlatformSettings() {
    try {
      const settingsRef = doc(db, 'settings', 'platform');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      } else {
        // Default settings
        const defaultSettings = {
          maintenanceMode: false,
          minWithdrawal: 100,
          maxWithdrawal: 50000,
          depositFee: 0,
          withdrawalFee: 2.5,
          welcomeBonus: 100,
          maxBetLimit: 10000,
          minBetLimit: 10
        };
        
        await setDoc(settingsRef, defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error getting platform settings:', error);
      return {
        maintenanceMode: false,
        minWithdrawal: 100,
        maxWithdrawal: 50000,
        depositFee: 0,
        withdrawalFee: 2.5
      };
    }
  },

  async updatePlatformSettings(settings, adminId) {
    try {
      const settingsRef = doc(db, 'settings', 'platform');
      await updateDoc(settingsRef, settings);
      
      // Log the action
      await addDoc(collection(db, 'admin_logs'), {
        action: 'platform_settings_updated',
        settings,
        adminId,
        timestamp: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating platform settings:', error);
      throw error;
    }
  }
}; 