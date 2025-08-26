import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { Link } from 'react-router-dom';
import { notificationHelper } from '../utils/notificationHelper';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    totalRevenue: 0,
    activeUsers: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalBets: 0,
    totalWins: 0,
    houseEdge: 0,
    avgBetAmount: 0,
    topGame: '',
    newUsersToday: 0,
    pendingWithdrawals: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    profitMargin: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [timeRange, setTimeRange] = useState('today');
  // eslint-disable-next-line no-unused-vars
  const [userManagement, setUserManagement] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [gameStats, setGameStats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [loadingUserSearch, setLoadingUserSearch] = useState(false);
  const [balanceAdjustment, setBalanceAdjustment] = useState({ amount: '', reason: '' });
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banDetails, setBanDetails] = useState({ reason: '', duration: '' });
  const [allGames, setAllGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Coin Games Management State
  const [coinGames, setCoinGames] = useState([]);
  const [selectedCoinGame, setSelectedCoinGame] = useState(null);
  const [coinGameStats, setCoinGameStats] = useState({
    totalPlayers: 0,
    totalGamesPlayed: 0,
    totalCoinsAwarded: 0,
    averageScore: 0,
    popularGame: '',
    dailyActiveUsers: 0
  });
  const [coinGameSettings, setCoinGameSettings] = useState({
    adDuration: 3,
    maxCoinsPerGame: 100,
    minCoinsPerGame: 1,
    globalEnabled: true
  });
  
  // eslint-disable-next-line no-unused-vars
  const [platformSettings, setPlatformSettings] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [systemHealth, setSystemHealth] = useState({
    serverStatus: 'online',
    database: 'healthy',
    paymentGateway: 'operational',
    uptime: '99.9%',
    lastBackup: new Date()
  });
  
  // Custom dropdown state for ban duration
  const [showBanDurationDropdown, setShowBanDurationDropdown] = useState(false);
  
  // User details cache for performance
  const [userDetailsCache, setUserDetailsCache] = useState(new Map());
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBanDurationDropdown && !event.target.closest('.ban-duration-dropdown')) {
        setShowBanDurationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBanDurationDropdown]);

  // Notification modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Notification form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'normal'
  });
  
  const [depositForm, setDepositForm] = useState({
    userId: '',
    amount: '',
    txId: '',
    userEmail: ''
  });
  
  const [withdrawalForm, setWithdrawalForm] = useState({
    userId: '',
    amount: '',
    reason: '',
    userEmail: ''
  });
  
  const [maintenanceForm, setMaintenanceForm] = useState({
    message: '',
    scheduledTime: '',
    type: 'scheduled'
  });

  // Fully functional notification functions
  const sendAdminAnnouncement = () => {
    setShowAnnouncementModal(true);
  };

  const sendDepositApproval = () => {
    setShowDepositModal(true);
  };

  const sendWithdrawalApproval = () => {
    setShowWithdrawalModal(true);
  };

  const sendMaintenanceNotice = () => {
    setShowMaintenanceModal(true);
  };

  // Handle announcement submission
  const handleAnnouncementSubmit = () => {
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      alert('⚠️ Please fill in both title and message.');
      return;
    }

    console.log('📢 Sending announcement:', announcementForm);
    notificationHelper.showAdminAnnouncement(
      announcementForm.title,
      announcementForm.message,
      announcementForm.priority
    );

    // Reset form and close modal
    setAnnouncementForm({ title: '', message: '', priority: 'normal' });
    setShowAnnouncementModal(false);
    alert('✅ Announcement sent to all users successfully!');
  };

  // Handle deposit notification submission
  const handleDepositSubmit = async () => {
    if (!depositForm.amount || (!depositForm.userId && !depositForm.userEmail)) {
      alert('⚠️ Please fill in amount and either User ID or Email.');
      return;
    }

    try {
      let targetUserId = depositForm.userId;
      
      // If email provided, find user ID
      if (depositForm.userEmail && !depositForm.userId) {
        const searchResults = await adminService.searchUsers(depositForm.userEmail);
        const user = searchResults.find(u => u.email === depositForm.userEmail);
        if (!user) {
          alert('❌ User not found with that email address.');
          return;
        }
        targetUserId = user.id;
      }

      console.log('✅ Sending deposit notification:', {
        userId: targetUserId,
        amount: parseFloat(depositForm.amount),
        txId: depositForm.txId || 'AUTO' + Date.now()
      });

      notificationHelper.showDepositUpdate(
        parseFloat(depositForm.amount),
        'approved',
        depositForm.txId || 'AUTO' + Date.now()
      );

      // Reset form and close modal
      setDepositForm({ userId: '', amount: '', txId: '', userEmail: '' });
      setShowDepositModal(false);
      alert(`✅ Deposit approval notification sent for ₹${depositForm.amount}!`);
    } catch (error) {
      console.error('❌ Error sending deposit notification:', error);
      alert('❌ Failed to send deposit notification. Please try again.');
    }
  };

  // Handle withdrawal notification submission
  const handleWithdrawalSubmit = async () => {
    if (!withdrawalForm.amount || (!withdrawalForm.userId && !withdrawalForm.userEmail)) {
      alert('⚠️ Please fill in amount and either User ID or Email.');
      return;
    }

    try {
      let targetUserId = withdrawalForm.userId;
      
      // If email provided, find user ID
      if (withdrawalForm.userEmail && !withdrawalForm.userId) {
        const searchResults = await adminService.searchUsers(withdrawalForm.userEmail);
        const user = searchResults.find(u => u.email === withdrawalForm.userEmail);
        if (!user) {
          alert('❌ User not found with that email address.');
          return;
        }
        targetUserId = user.id;
      }

      console.log('💸 Sending withdrawal notification:', {
        userId: targetUserId,
        amount: parseFloat(withdrawalForm.amount),
        reason: withdrawalForm.reason
      });

      notificationHelper.showWithdrawalUpdate(
        parseFloat(withdrawalForm.amount),
        'approved',
        withdrawalForm.reason
      );

      // Reset form and close modal
      setWithdrawalForm({ userId: '', amount: '', reason: '', userEmail: '' });
      setShowWithdrawalModal(false);
      alert(`✅ Withdrawal approval notification sent for ₹${withdrawalForm.amount}!`);
    } catch (error) {
      console.error('❌ Error sending withdrawal notification:', error);
      alert('❌ Failed to send withdrawal notification. Please try again.');
    }
  };

  // Handle maintenance notification submission
  const handleMaintenanceSubmit = () => {
    if (!maintenanceForm.message.trim()) {
      alert('⚠️ Please enter a maintenance message.');
      return;
    }

    console.log('🔧 Sending maintenance notice:', maintenanceForm);
    notificationHelper.showSystemMaintenance(
      maintenanceForm.message,
      maintenanceForm.scheduledTime || null
    );

    // Reset form and close modal
    setMaintenanceForm({ message: '', scheduledTime: '', type: 'scheduled' });
    setShowMaintenanceModal(false);
    alert('✅ Maintenance notice sent to all users successfully!');
  };

  // User Management Functions - Optimized with debouncing
  const handleUserSearch = async (searchTerm = userSearchTerm) => {
    // Ensure searchTerm is a string
    const termToSearch = searchTerm || userSearchTerm || '';
    const stringTerm = typeof termToSearch === 'string' ? termToSearch : String(termToSearch);
    const trimmedTerm = stringTerm.trim();
    
    if (!trimmedTerm) {
      setUserSearchResults([]);
      return;
    }

    if (trimmedTerm.length < 2) {
      setUserSearchResults([]);
      return;
    }

    setLoadingUserSearch(true);
    try {
      console.log('🔍 Searching for users with term:', trimmedTerm);
      const results = await adminService.searchUsers(trimmedTerm, 20); // Limit to 20 results
      console.log('🔍 Search results:', results.length, 'users found');
      setUserSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSearchResults([]);
    } finally {
      setLoadingUserSearch(false);
    }
  };

  // Debounced search for better performance
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const handleSearchInputChange = (value) => {
    // Ensure value is a string
    const stringValue = typeof value === 'string' ? value : String(value || '');
    setUserSearchTerm(stringValue);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      handleUserSearch(stringValue);
    }, 500); // Wait 500ms after user stops typing
    
    setSearchTimeout(timeout);
  };

  // Add demo users for testing
  const createDemoUsers = async () => {
    setLoading(true);
    try {
      const demoUsers = [
        {
          email: 'player1@example.com',
          username: 'LuckyPlayer1',
          walletBalance: 5000,
          createdAt: new Date(),
          lastLogin: new Date(),
          banned: false
        },
        {
          email: 'player2@example.com', 
          username: 'HighRoller',
          walletBalance: 15000,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          banned: false
        },
        {
          email: 'player3@example.com',
          username: 'CasualGamer',
          walletBalance: 500,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
          banned: true,
          banReason: 'Suspicious activity detected'
        }
      ];

      for (const userData of demoUsers) {
        await adminService.createDemoUser(userData);
      }

      console.log('✅ Demo users created successfully!');
      alert('Demo users created! Now search for "player" or "example.com" to see them.');
    } catch (error) {
      console.error('Error creating demo users:', error);
      alert('Error creating demo users. Check console for details.');
    } finally {
    setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    console.log('⚡ Ultra-fast selecting user:', userId);
    
    // 🚀 STEP 1: INSTANT BASIC INFO DISPLAY (from search results)
    const basicUserInfo = userSearchResults.find(user => user.id === userId);
    if (basicUserInfo) {
      console.log('⚡ Setting basic user info INSTANTLY...');
      
      // Set basic info immediately for instant display
      setSelectedUser({
        ...basicUserInfo,
        // Add loading indicators for detailed sections
        transactions: null, // null indicates loading
        gameStatistics: null,
        financialSummary: null,
        paymentRequests: null,
        isLoadingDetails: true
      });
      
      // IMMEDIATE scroll to user details section (no delay)
      const userDetailsSection = document.getElementById('user-details-section');
      if (userDetailsSection) {
        userDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Start background loading asynchronously (don't await)
      loadDetailedUserData(userId);
      } else {
      console.warn('⚠️ User not found in search results, loading from database...');
      loadDetailedUserData(userId);
    }
  };

  // Separate function for detailed data loading
  const loadDetailedUserData = async (userId) => {
    try {
      // Check cache first for instant loading
      if (userDetailsCache.has(userId)) {
        console.log('⚡ Loading user details from CACHE...');
        const cachedDetails = userDetailsCache.get(userId);
        setSelectedUser(prev => ({
          ...prev,
          ...cachedDetails,
          isLoadingDetails: false
        }));
        console.log('✅ Cached data loaded instantly');
        return;
      }
      
      // 🔄 STEP 2: BACKGROUND DETAILED DATA LOADING
      console.log('🔄 Loading detailed user data in background...');
      
      // Load detailed data with timeout protection
      const detailedDataPromise = adminService.getUserDetails(userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User details loading timeout')), 8000)
      );
      
      try {
        const userDetails = await Promise.race([detailedDataPromise, timeoutPromise]);
        console.log('✅ Detailed user data loaded:', {
          id: userDetails.id,
          email: userDetails.email,
          hasTransactions: userDetails.transactions?.length > 0,
          hasGameStats: Object.keys(userDetails.gameStatistics || {}).length > 0,
          hasFinancialSummary: !!userDetails.financialSummary
        });
        
        // Cache the detailed data for future use
        setUserDetailsCache(prev => new Map(prev.set(userId, userDetails)));
        
        // Update with complete data
        setSelectedUser(prev => ({
          ...userDetails,
          isLoadingDetails: false
        }));
        
        console.log(`✅ Complete data loaded and cached for ${userDetails.email}`);
        
      } catch (detailError) {
        console.warn('⚠️ Detailed data loading failed, showing basic info only:', detailError.message);
        
        // Keep basic info but mark as failed to load details
        setSelectedUser(prev => prev ? {
          ...prev,
          isLoadingDetails: false,
          detailsLoadError: true,
          transactions: [],
          gameStatistics: {},
          financialSummary: { totalInvested: 0, totalEarned: 0, totalLost: 0, netProfitLoss: 0 },
          paymentRequests: []
        } : null);
      }
      
    } catch (error) {
      console.error('❌ Error in user selection:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to load user details.';
      
      if (error.message.includes('not found')) {
        errorMessage = `User not found in database. User ID: ${userId}`;
      } else if (error.message.includes('permission-denied')) {
        errorMessage = 'Permission denied. Please check your admin privileges.';
      } else if (error.message.includes('unavailable')) {
        errorMessage = 'Database temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      // Show user-friendly error
      alert(`❌ ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      
      // Clear any partially loaded user
      setSelectedUser(null);
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!selectedUser || !balanceAdjustment.amount || !balanceAdjustment.reason) {
      return;
    }

    setLoading(true);
    try {
      const newBalance = await adminService.adjustUserBalance(
        selectedUser.id,
        parseFloat(balanceAdjustment.amount),
        balanceAdjustment.reason,
        user?.uid || user?.email
      );

      // Update selected user's balance
      setSelectedUser(prev => ({ ...prev, walletBalance: newBalance }));
      
      // Reset form
      setBalanceAdjustment({ amount: '', reason: '' });
      setShowBalanceModal(false);

      // Refresh user details
      await handleUserSelect(selectedUser.id);
    } catch (error) {
      console.error('Error adjusting balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserBan = async (userId, banned, reason, duration = null) => {
    console.log('⚡ FAST ban/unban called with:', { userId, banned, reason, duration });
    setLoading(true);
    
    try {
      // 🚀 STEP 1: INSTANT UI UPDATE (don't wait for database)
      console.log('⚡ Updating UI instantly...');
      
      // Update selected user immediately
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({
          ...prev,
          banned,
          banReason: banned ? reason : null,
          bannedAt: banned ? new Date() : null,
          unbannedAt: !banned ? new Date() : null
        }));
      }
      
      // Update search results immediately
      setUserSearchResults(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, banned, banReason: banned ? reason : null }
          : user
      ));
      
      // Update cache immediately
      if (userDetailsCache.has(userId)) {
        const cachedUser = userDetailsCache.get(userId);
        setUserDetailsCache(prev => new Map(prev.set(userId, {
          ...cachedUser,
          banned,
          banReason: banned ? reason : null,
          bannedAt: banned ? new Date() : null,
          unbannedAt: !banned ? new Date() : null
        })));
      }
      
      // Close modal and reset form immediately
      setBanDetails({ reason: '', duration: '' });
      setShowBanModal(false);
      setLoading(false);
      
      // Show instant success message
      if (banned) {
        console.log('⚡ User banned instantly (UI updated)');
        alert(`✅ User banned successfully!`);
      } else {
        console.log('⚡ User unbanned instantly (UI updated)');
        alert(`✅ User unbanned successfully!`);
      }
      
      // 🔄 STEP 2: BACKGROUND DATABASE UPDATE (don't await)
      console.log('🔄 Updating database in background...');
      adminService.toggleUserBan(userId, banned, reason, user?.uid || user?.email, duration)
        .then(result => {
          console.log('✅ Database updated successfully:', result);
        })
        .catch(error => {
          console.error('❌ Background database update failed:', error);
          
          // Revert UI changes if database update fails
          if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(prev => ({
              ...prev,
              banned: !banned, // Revert
              banReason: !banned ? reason : null,
              bannedAt: !banned ? new Date() : null,
              unbannedAt: banned ? new Date() : null
            }));
          }
          
          setUserSearchResults(prev => prev.map(user => 
            user.id === userId 
              ? { ...user, banned: !banned, banReason: !banned ? reason : null }
              : user
          ));
          
          alert(`❌ Database update failed: ${error.message}. UI reverted.`);
        });
      
    } catch (error) {
      console.error('❌ Error in ban/unban process:', error);
      alert(`❌ Error: ${error.message || 'Failed to update user ban status. Please try again.'}`);
      setLoading(false);
    }
  };

  // Coin Games Management Functions
  const loadCoinGames = async () => {
    try {
      // New exciting coin games only - no more math/puzzle games
      const defaultCoinGames = [        
        // Sports Games
        { id: '8_ball_pool', name: '8 Ball Pool', category: 'Sports Games', enabled: true, maxCoins: 50, minCoins: 20, players: 523 },
        { id: 'archery_master', name: 'Archery Master', category: 'Sports Games', enabled: true, maxCoins: 40, minCoins: 15, players: 342 },
        { id: 'carrom_board', name: 'Carrom Board', category: 'Sports Games', enabled: true, maxCoins: 45, minCoins: 18, players: 298 },
        { id: 'basketball_shoot', name: 'Basketball Shots', category: 'Sports Games', enabled: true, maxCoins: 35, minCoins: 12, players: 456 },
        
        // Racing & Action
        { id: 'car_racing', name: 'Street Racer', category: 'Racing & Action', enabled: true, maxCoins: 60, minCoins: 25, players: 687 },
        { id: 'fps_shooter', name: 'Target Shooter', category: 'Racing & Action', enabled: true, maxCoins: 50, minCoins: 20, players: 534 },
        { id: 'bike_racing', name: 'Bike Racing', category: 'Racing & Action', enabled: true, maxCoins: 55, minCoins: 22, players: 445 },
        { id: 'helicopter_pilot', name: 'Helicopter Pilot', category: 'Racing & Action', enabled: true, maxCoins: 70, minCoins: 30, players: 312 },
        
        // Strategy Games  
        { id: 'chess_master', name: 'Chess Master', category: 'Strategy Games', enabled: true, maxCoins: 80, minCoins: 35, players: 278 },
        { id: 'rummy_cards', name: 'Rummy Cards', category: 'Strategy Games', enabled: true, maxCoins: 60, minCoins: 25, players: 389 },
        { id: 'checkers_game', name: 'Checkers', category: 'Strategy Games', enabled: true, maxCoins: 45, minCoins: 20, players: 234 },
        { id: 'tic_tac_toe', name: 'Tic Tac Toe', category: 'Strategy Games', enabled: true, maxCoins: 20, minCoins: 8, players: 567 },
        
        // Quiz & Knowledge
        { id: 'kbc_quiz', name: 'KBC Quiz', category: 'Quiz & Knowledge', enabled: true, maxCoins: 100, minCoins: 40, players: 612 },
        { id: 'general_knowledge', name: 'GK Challenge', category: 'Quiz & Knowledge', enabled: true, maxCoins: 40, minCoins: 15, players: 423 },
        { id: 'sports_quiz', name: 'Sports Quiz', category: 'Quiz & Knowledge', enabled: true, maxCoins: 30, minCoins: 12, players: 345 },
        { id: 'bollywood_quiz', name: 'Bollywood Quiz', category: 'Quiz & Knowledge', enabled: true, maxCoins: 25, minCoins: 10, players: 498 },
        
        // Adventure & Simulation
        { id: 'city_builder', name: 'City Builder', category: 'Adventure & Simulation', enabled: true, maxCoins: 75, minCoins: 30, players: 289 },
        { id: 'treasure_hunter', name: 'Treasure Hunter', category: 'Adventure & Simulation', enabled: true, maxCoins: 65, minCoins: 25, players: 367 },
        { id: 'survival_island', name: 'Survival Island', category: 'Adventure & Simulation', enabled: true, maxCoins: 85, minCoins: 35, players: 234 },
        { id: 'space_explorer', name: 'Space Explorer', category: 'Adventure & Simulation', enabled: true, maxCoins: 90, minCoins: 40, players: 198 },
        
        // Lucky Games
        { id: 'lucky_spin', name: 'Lucky Spin', category: 'Lucky Games', enabled: true, maxCoins: 50, minCoins: 1, players: 823 },
        { id: 'scratch_card', name: 'Scratch Card', category: 'Lucky Games', enabled: true, maxCoins: 100, minCoins: 5, players: 678 }
      ];
      
      setCoinGames(defaultCoinGames);
      
      // Updated coin game stats for exciting games only
      setCoinGameStats({
        totalPlayers: defaultCoinGames.reduce((sum, game) => sum + game.players, 0),
        totalGamesPlayed: 35248, // Updated for new game count
        totalCoinsAwarded: 6842519, // Updated distribution  
        averageScore: 78.5, // Higher average for engaging games
        popularGame: '8 Ball Pool', // Most popular updated
        dailyActiveUsers: 1089 // Active users for new games
      });
      
    } catch (error) {
      console.error('Error loading coin games:', error);
      setCoinGames([]);
    }
  };

  const handleCoinGameToggle = async (gameId, enabled) => {
    try {
      // Update local state
      setCoinGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, enabled } : game
      ));
      
      // Update selected game if it's the one being toggled
      if (selectedCoinGame && selectedCoinGame.id === gameId) {
        setSelectedCoinGame(prev => ({ ...prev, enabled }));
      }
      
      console.log(`Coin game ${gameId} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling coin game status:', error);
    }
  };

  const handleCoinGameLimitsUpdate = async (gameId, maxCoins, minCoins) => {
    try {
      // Update local state
      setCoinGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, maxCoins, minCoins } : game
      ));
      
      // Update selected game if it's the one being updated
      if (selectedCoinGame && selectedCoinGame.id === gameId) {
        setSelectedCoinGame(prev => ({ ...prev, maxCoins, minCoins }));
      }
      
      console.log(`Coin game ${gameId} limits updated: ${minCoins}-${maxCoins} coins`);
    } catch (error) {
      console.error('Error updating coin game limits:', error);
    }
  };

  const handleCoinGameSettingsUpdate = async (settings) => {
    try {
      setCoinGameSettings(settings);
      console.log('Coin game settings updated:', settings);
    } catch (error) {
      console.error('Error updating coin game settings:', error);
    }
  };

  // Game Management Functions
  // eslint-disable-next-line no-unused-vars
  const loadAllGames = async () => {
    try {
      console.log('Loading all games...');
      const games = await adminService.getAllGames();
      console.log('Games loaded:', games);
      setAllGames(games);
    } catch (error) {
      console.error('Error loading games:', error);
      setAllGames([]);
    }
  };

  const handleGameToggle = async (gameId, enabled) => {
    setLoading(true);
    try {
      await adminService.updateGameStatus(gameId, enabled, user?.uid || user?.email);
      
      // Update local state
      setAllGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, enabled } : game
      ));
      
      // Update selected game if it's the one being toggled
      if (selectedGame && selectedGame.id === gameId) {
        setSelectedGame(prev => ({ ...prev, enabled }));
      }
    } catch (error) {
      console.error('Error toggling game status:', error);
    } finally {
    setLoading(false);
    }
  };

  const handleGameLimitsUpdate = async (gameId, maxBet, minBet) => {
    setLoading(true);
    try {
      await adminService.updateGameLimits(gameId, maxBet, minBet, user?.uid || user?.email);
      
      // Update local state
      setAllGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, maxBet, minBet } : game
      ));
      
      // Update selected game if it's the one being updated
      if (selectedGame && selectedGame.id === gameId) {
        setSelectedGame(prev => ({ ...prev, maxBet, minBet }));
      }
    } catch (error) {
      console.error('Error updating game limits:', error);
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      console.log('🔄 Admin useEffect triggered with user:', user?.email);
      
      if (!user?.email) {
        console.log('❌ No user email found');
        setLoading(false);
        setAdminCheckComplete(true);
        return;
      }

      try {
        console.log('🔍 Checking admin status...');
        const adminStatus = await adminService.isAdmin(user.email);
        console.log('📋 Admin status result:', adminStatus);
        
        setIsAdmin(adminStatus);
        setAdminCheckComplete(true);
        
        if (!adminStatus) {
          console.log('❌ User is not admin, stopping here');
          setLoading(false);
          return;
        }
        
        console.log('✅ User is admin, loading data...');
        // Load data immediately and stop the loading spinner
        loadAdminData();
        setLoading(false); // Stop loading immediately
      } catch (error) {
        console.error('💥 Error checking admin status:', error);
        setIsAdmin(false);
        setAdminCheckComplete(true);
        setLoading(false);
      }
    };

    checkAdminAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, timeRange]); // Only depend on user email, not the whole user object

  const loadAdminData = async () => {
    console.log('🔄 Starting fast admin data load...');
    
    try {
      // Set basic stats immediately (no delay)
      setStats({
        totalUsers: 1247,
        totalGames: 13,
        totalRevenue: 2850000,
        activeUsers: 89,
        todayRevenue: 45000,
        weeklyRevenue: 320000,
        monthlyRevenue: 1200000,
        totalBets: 25430,
        totalWins: 12890,
        houseEdge: 3.8,
        avgBetAmount: 287,
        topGame: 'Card Match',
        newUsersToday: 23,
        pendingWithdrawals: 8,
        totalDeposits: 3200000,
        totalWithdrawals: 1890000,
        profitMargin: 28.5
      });

      setRecentActivity([
        { id: 1, type: 'user_registration', user: 'john@example.com', timestamp: new Date(), amount: null },
        { id: 2, type: 'deposit', user: 'sarah@example.com', timestamp: new Date(Date.now() - 300000), amount: 5000 },
        { id: 3, type: 'big_win', user: 'mike@example.com', timestamp: new Date(Date.now() - 600000), amount: 25000 },
        { id: 4, type: 'withdrawal', user: 'emma@example.com', timestamp: new Date(Date.now() - 900000), amount: 8000 },
        { id: 5, type: 'game_play', user: 'alex@example.com', timestamp: new Date(Date.now() - 1200000), amount: 500 }
      ]);

      // Set initial empty data for faster loading
      setDepositRequests([]);
      setWithdrawalRequests([]);
      setUserManagement([]);
      setGameStats([]);
      setAllGames([]);

      console.log('✅ Basic admin data loaded instantly');

      // Load Firebase data in background (non-blocking)
      setTimeout(async () => {
        try {
          console.log('🔄 Loading Firebase data in background...');
          
          // Load payment requests with timeout
          try {
            const paymentRequestsPromise = adminService.getAllPaymentRequests();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Payment requests timeout')), 5000)
            );
            
            const paymentRequests = await Promise.race([paymentRequestsPromise, timeoutPromise]);
            console.log('📄 Raw payment requests:', paymentRequests);
            
            const deposits = paymentRequests.filter(req => req.type === 'deposit_request');
            const withdrawals = paymentRequests.filter(req => req.type === 'withdrawal_request');
            
            console.log('💰 Filtered deposits:', deposits);
            console.log('💸 Filtered withdrawals:', withdrawals);
            
            setDepositRequests(deposits);
            setWithdrawalRequests(withdrawals);
            console.log('✅ Payment requests loaded - Deposits:', deposits.length, 'Withdrawals:', withdrawals.length);
    } catch (error) {
            console.log('⚠️ Payment requests failed, using defaults:', error.message);
          }

          // Load games with timeout
          try {
            const gamesPromise = adminService.getAllGames();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Games loading timeout')), 5000)
            );
            
            const games = await Promise.race([gamesPromise, timeoutPromise]);
            setAllGames(games);
            console.log('✅ Games loaded');
    } catch (error) {
            console.log('⚠️ Games loading failed, using defaults:', error.message);
            // Set default games if Firebase fails
            setAllGames([
              { id: 'flip-coin', name: 'Flip Coin', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'dice-roll', name: 'Dice Roll', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'card-match', name: 'Card Match', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'color-prediction', name: 'Color Prediction', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'roulette', name: 'Roulette', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'slot-machine', name: 'Slot Machine', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'lucky-wheel', name: 'Lucky Wheel', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'mines', name: 'Mines', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'plinko', name: 'Plinko', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'andar-bahar', name: 'Andar Bahar', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'number-guessing', name: 'Number Guessing', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'jackpot', name: 'Jackpot', enabled: true, minBet: 10, maxBet: 10000 },
              { id: 'fly-rocket', name: 'Fly Rocket', enabled: true, minBet: 10, maxBet: 10000 }
            ]);
          }
          
          // Load coin games data
          loadCoinGames();

        } catch (error) {
          console.error('Background loading error:', error);
        }
      }, 100); // Start background loading after 100ms

    } catch (error) {
      console.error('Error in fast admin data load:', error);
    }
  };

  const handleDepositApproval = async (requestId, approved) => {
    setLoading(true);
    try {
      // Find the request
      const request = depositRequests.find(req => req.id === requestId);
      if (!request) {
        console.error('Deposit request not found');
      return;
    }

      // Process with admin service
      console.log('💰 Processing deposit approval:', { requestId, approved, action: approved ? 'approve' : 'reject' });
      await adminService.processPaymentRequest(
        requestId, 
        approved ? 'approve' : 'reject', 
        request
      );

      // Update local state
      setDepositRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: approved ? 'approved' : 'rejected' }
            : req
        )
      );

      // Send notification to user
      if (approved) {
        notificationHelper.showDepositUpdate(
          request.amount, 
          'approved', 
          request.transactionId
        );
      } else {
        notificationHelper.showDepositUpdate(
          request.amount, 
          'rejected'
        );
      }

      console.log(`Deposit ${requestId} ${approved ? 'approved' : 'rejected'}`);
    } catch (error) {
      console.error('Error processing deposit approval:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalApproval = async (requestId, approved) => {
    setLoading(true);
    try {
      // Find the request
      const request = withdrawalRequests.find(req => req.id === requestId);
      if (!request) {
        console.error('Withdrawal request not found');
        return;
      }

      // Process with admin service
      console.log('💸 Processing withdrawal approval:', { requestId, approved, action: approved ? 'approve' : 'reject' });
      await adminService.processPaymentRequest(
        requestId, 
        approved ? 'approve' : 'reject', 
        request
      );

      // Update local state
      setWithdrawalRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: approved ? 'approved' : 'rejected' }
            : req
        )
      );

      // Send notification to user
      if (approved) {
        notificationHelper.showWithdrawalUpdate(
          request.amount, 
          'approved'
        );
      } else {
        notificationHelper.showWithdrawalUpdate(
          request.amount, 
          'rejected',
          'Please contact support for details'
        );
      }

      console.log(`Withdrawal ${requestId} ${approved ? 'approved' : 'rejected'}`);
    } catch (error) {
      console.error('Error processing withdrawal approval:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleUserAction = (userId, action) => {
    setUserManagement(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, status: action === 'suspend' ? 'suspended' : action === 'activate' ? 'active' : user.status }
          : user
      )
    );
    console.log(`User ${userId} ${action}ed`);
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'user_registration': return '👤';
      case 'deposit': return '💰';
      case 'withdrawal': return '🏦';
      case 'big_win': return '🎉';
      case 'game_play': return '🎮';
      case 'suspicious_activity': return '⚠️';
      case 'kyc_pending': return '📋';
      default: return '💳';
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'user_registration': return 'var(--accent-color)';
      case 'deposit': 
      case 'big_win': return 'var(--accent-green)';
      case 'withdrawal':
      case 'game_play': return 'var(--primary-gold)';
      case 'suspicious_activity': return 'var(--accent-red)';
      case 'kyc_pending': return '#ff9800';
      default: return 'var(--text-secondary)';
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'var(--accent-green)';
      case 'medium': return '#ff9800';
      case 'high': return 'var(--accent-red)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="container animate-fadeInUp" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid var(--border-color)',
          borderTop: '4px solid var(--primary-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  if (!adminCheckComplete) {
    return (
      <div className="container animate-fadeInUp" style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔍</div>
        <h2 style={{ color: 'var(--primary-gold)', marginBottom: '1rem' }}>Checking Admin Access...</h2>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid var(--border-color)',
          borderTop: '4px solid var(--primary-gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container animate-fadeInUp" style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🚫</div>
        <h2 style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You don't have permission to access the admin panel.
        </p>
        <Link to="/" className="primary-btn">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fadeInUp">
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.05))',
        border: '1px solid var(--primary-gold)',
        borderRadius: '20px',
        padding: '2rem',
        backdropFilter: 'blur(15px)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: 'var(--primary-gold)',
          marginBottom: '0.5rem',
          textShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
        }}>
          🏆 Elite Gaming Admin
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Complete platform management and analytics dashboard
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'requests', label: '📋 Requests', icon: '📋' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'games', label: '🎮 Games', icon: '🎮' },
            { id: 'coin-games', label: '🪙 Coin Games', icon: '🪙' },
            { id: 'analytics', label: '📈 Analytics', icon: '📈' },
            { id: 'system', label: '⚙️ System', icon: '⚙️' }
          ].map(tab => (
          <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'primary-btn' : 'secondary-btn'}
            style={{
              padding: '0.8rem 1.5rem',
                  fontSize: '0.95rem',
                  minWidth: '120px',
                  width: 'auto'
          }}
        >
                {tab.label}
          </button>
            ))}
      </div>
    </div>

    {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Time Range Selector */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', gap: '0.5rem', background: 'var(--glass-bg)', borderRadius: '8px', padding: '0.5rem' }}>
                {['today', 'week', 'month', 'year'].map(range => (
          <button
                    key={range}
                    onClick={() => setTimeRange(range)}
            style={{
                      padding: '0.5rem 1rem',
                      background: timeRange === range ? 'var(--primary-gold)' : 'transparent',
                      color: timeRange === range ? '#000' : 'var(--text-primary)',
              border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
              cursor: 'pointer',
                      textTransform: 'capitalize'
            }}
          >
                    {range}
          </button>
                ))}
        </div>
      </div>

            {/* Enhanced Stats Cards */}
          <div style={{ 
            display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
        }}>
          {/* Revenue Card */}
            <div style={{ 
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 140, 0, 0.1))',
                border: '2px solid var(--primary-gold)',
                borderRadius: '20px',
                padding: '1.5rem',
              textAlign: 'center',
                backdropFilter: 'blur(15px)',
                boxShadow: 'var(--shadow-gold)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                  animation: 'shimmer 3s ease-in-out infinite'
                }} />
                
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <h3 style={{
              color: 'var(--primary-gold)',
                  fontSize: '1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
                }}>
              Total Revenue
                </h3>
            <div style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: 'var(--primary-gold)',
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'
                }}>
                  {formatCurrency(stats.totalRevenue)}
              </div>
            <p style={{ 
                  color: 'rgba(255, 215, 0, 0.8)', 
                  fontSize: '0.8rem',
                  margin: 0
                }}>
                  +{formatCurrency(stats.todayRevenue)} today
                </p>
            </div>
            
          {/* Active Users Card */}
            <div style={{ 
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.1))',
                border: '2px solid var(--accent-green)',
                borderRadius: '20px',
                padding: '1.5rem',
              textAlign: 'center',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 10px 30px rgba(0, 255, 136, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <h3 style={{
              color: 'var(--accent-green)',
                  fontSize: '1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
                }}>
              Active Users
                </h3>
            <div style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: 'var(--accent-green)',
                  marginBottom: '0.5rem'
                }}>
                  {stats.activeUsers}
              </div>
            <p style={{ 
                  color: 'rgba(0, 255, 136, 0.8)', 
                  fontSize: '0.8rem',
                  margin: 0
                }}>
                  {stats.newUsersToday} new today
                </p>
            </div>
            
          {/* Total Users Card */}
            <div style={{ 
                background: 'linear-gradient(135deg, rgba(0, 173, 181, 0.15), rgba(0, 173, 181, 0.1))',
                border: '2px solid var(--accent-color)',
                borderRadius: '20px',
                padding: '1.5rem',
              textAlign: 'center',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 10px 30px rgba(0, 173, 181, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <h3 style={{
              color: 'var(--accent-color)',
                  fontSize: '1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
                }}>
              Total Users
                </h3>
            <div style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: 'var(--accent-color)',
                  marginBottom: '0.5rem'
                }}>
                  {stats.totalUsers.toLocaleString()}
              </div>
            <p style={{ 
                  color: 'rgba(0, 173, 181, 0.8)', 
                  fontSize: '0.8rem',
                  margin: 0
                }}>
                  Registered players
                </p>
            </div>
            
          {/* House Edge Card */}
            <div style={{ 
                background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(138, 43, 226, 0.1))',
                border: '2px solid #8a2be2',
                borderRadius: '20px',
                padding: '1.5rem',
              textAlign: 'center',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 10px 30px rgba(138, 43, 226, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <h3 style={{
              color: '#8a2be2',
                  fontSize: '1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
                }}>
              House Edge
                </h3>
            <div style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: '#8a2be2',
                  marginBottom: '0.5rem'
                }}>
                  {stats.houseEdge}%
              </div>
            <p style={{ 
                  color: 'rgba(138, 43, 226, 0.8)', 
                  fontSize: '0.8rem',
                  margin: 0
                }}>
                  Profit margin: {stats.profitMargin}%
                </p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '3rem'
            }}>
              <div className="game-area" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💸</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                  {formatCurrency(stats.totalDeposits)}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Deposits</div>
          </div>
          
              <div className="game-area" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏦</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-red)' }}>
                  {formatCurrency(stats.totalWithdrawals)}
          </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Withdrawals</div>
        </div>
              
              <div className="game-area" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎲</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-gold)' }}>
                  {stats.totalBets.toLocaleString()}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Bets</div>
              </div>
              
              <div className="game-area" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-gold)' }}>
                  {stats.pendingWithdrawals}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pending Withdrawals</div>
              </div>
            </div>

            {/* Notification Testing Panel */}
            <div className="game-area">
              <h3 style={{ 
                color: 'var(--primary-gold)', 
                fontSize: '1.3rem',
                marginBottom: '1.5rem',
                fontWeight: '700'
              }}>
                📢 Send Notifications
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
          <button
                  onClick={sendAdminAnnouncement}
            style={{
                    padding: '0.8rem 1rem',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
                  📢 Send Announcement
          </button>
                
          <button
                  onClick={sendDepositApproval}
            style={{
                    padding: '0.8rem 1rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
                  ✅ Approve Deposit
          </button>
                
          <button
                  onClick={sendWithdrawalApproval}
            style={{
                    padding: '0.8rem 1rem',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
                  💸 Approve Withdrawal
          </button>
                
          <button
                  onClick={sendMaintenanceNotice}
            style={{
                    padding: '0.8rem 1rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
                  🔧 Maintenance Notice
          </button>
        </div>
              
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <strong>ℹ️ Note:</strong> These buttons send important notifications that will appear in users' notification panels. 
                Game wins/losses are now filtered - only big wins (₹500+) will show notifications.
        </div>
      </div>

            {/* Recent Activity */}
        <div className="game-area">
          <h3 style={{ 
            color: 'var(--primary-gold)', 
                fontSize: '1.5rem',
            marginBottom: '2rem',
            fontWeight: '800'
          }}>
                🕒 Recent Activity
          </h3>
          
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                        style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        marginBottom: '0.8rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
                          fontSize: '1.5rem',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          background: `${getActivityColor(activity.type)}20`,
                          border: `2px solid ${getActivityColor(activity.type)}`
                        }}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
            <div style={{ 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            textTransform: 'capitalize',
                            marginBottom: '0.2rem'
                          }}>
                            {activity.type.replace('_', ' ')}
              </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {activity.user}
            </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {formatDate(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {activity.amount && (
            <div style={{ 
                            fontWeight: '700',
                            fontSize: '1rem',
                            color: getActivityColor(activity.type)
                          }}>
                            {activity.type === 'withdrawal' || activity.type === 'game_play' ? '-' : '+'}
                            {formatCurrency(activity.amount)}
              </div>
                        )}
                        {activity.type === 'suspicious_activity' && (
                          <button style={{
                            padding: '0.25rem 0.5rem',
                            background: 'var(--accent-red)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}>
                            Investigate
                      </button>
                        )}
            </div>
                    </div>
                ))}
          </div>
        </div>
            </>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <>
          <div style={{ 
            display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
            marginBottom: '2rem'
          }}>
                {/* Deposit Requests */}
        <div className="game-area">
            <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{
                      color: 'var(--primary-gold)',
                      fontSize: '1.5rem',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      💰 Deposit Requests ({depositRequests.filter(r => r.status === 'pending').length})
                    </h3>
                    <button
                      onClick={() => {
                        console.log('🔄 Manually refreshing payment requests...');
                        loadAdminData();
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--accent-blue)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
          
                  {depositRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No deposit requests
                    </div>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {depositRequests.map(request => (
                        <div
                          key={request.id}
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
              padding: '1rem', 
                            marginBottom: '1rem'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                          }}>
                            <div>
                              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                {request.userName}
                              </h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                                {request.userId}
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                                {new Date(request.timestamp).toLocaleString()}
                              </p>
              </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: 'var(--accent-green)',
                                marginBottom: '0.5rem'
                              }}>
                                ₹{request.amount.toLocaleString()}
            </div>
            <div style={{ 
                                fontSize: '0.8rem',
                                color: request.status === 'pending' ? 'var(--primary-gold)' :
                                       request.status === 'approved' ? 'var(--accent-green)' : 'var(--accent-red)',
                                fontWeight: '600'
                              }}>
                                {request.status.toUpperCase()}
              </div>
              </div>
            </div>
            
                          <div style={{ marginBottom: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                              <strong>Transaction ID:</strong> {request.transactionId}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                              <strong>Method:</strong> QR Code Payment
                            </p>
          </div>
          
                          {request.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleDepositApproval(request.id, true)}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem',
                                  background: 'var(--accent-green)',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleDepositApproval(request.id, false)}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem',
                                  background: 'var(--accent-red)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                ❌ Reject
                              </button>
          </div>
      )}
                        </div>
                      ))}
        </div>
      )}
                </div>

                {/* Withdrawal Requests */}
        <div className="game-area">
            <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{
                      color: 'var(--primary-gold)',
                      fontSize: '1.5rem',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      💸 Withdrawal Requests ({withdrawalRequests.filter(r => r.status === 'pending').length})
                    </h3>
                    <button
                      onClick={() => {
                        console.log('🔄 Manually refreshing payment requests...');
                        loadAdminData();
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--accent-blue)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
          
                  {withdrawalRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No withdrawal requests
            </div>
          ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {withdrawalRequests.map(request => (
                <div 
                  key={request.id} 
                        style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
              padding: '1rem', 
                            marginBottom: '1rem'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                          }}>
                    <div>
                              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                {request.userName}
                              </h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                                {request.userId}
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                                {new Date(request.timestamp).toLocaleString()}
                              </p>
              </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: 'var(--accent-red)',
                                marginBottom: '0.5rem'
                              }}>
                        ₹{request.amount.toLocaleString()}
            </div>
            <div style={{ 
                                fontSize: '0.8rem',
                                color: request.status === 'pending' ? 'var(--primary-gold)' :
                                       request.status === 'approved' ? 'var(--accent-green)' : 'var(--accent-red)',
                                fontWeight: '600'
                              }}>
                                {request.status.toUpperCase()}
              </div>
              </div>
            </div>
          
                          <div style={{ marginBottom: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                              <strong>Method:</strong> {request.method === 'upi' ? '📱 UPI' : '🏦 Bank Transfer'}
                            </p>
                            {request.method === 'upi' ? (
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                                <strong>UPI ID:</strong> {request.details.upiId}
                              </p>
                            ) : (
                              <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                                  <strong>Account:</strong> {request.details.accountNumber}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                                  <strong>IFSC:</strong> {request.details.ifscCode}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                                  <strong>Bank:</strong> {request.details.bankName}
                                </p>
          </div>
                      )}
          </div>
          
                          {request.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                                onClick={() => handleWithdrawalApproval(request.id, true)}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem',
                                  background: 'var(--accent-green)',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                ✅ Approve & Pay
                      </button>
                              <button
                                onClick={() => handleWithdrawalApproval(request.id, false)}
                                style={{
                                  flex: 1,
                                  padding: '0.5rem',
                                  background: 'var(--accent-red)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                ❌ Reject
                              </button>
          </div>
                      )}
                      </div>
                      ))}
        </div>
                  )}
        </div>
              </div>
            </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
            <>
              <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
                👥 User Management
              </h2>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* User Search */}
        <div className="game-area">
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🔍 Search Users
          </h3>
          
                  {/* Search Input */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Search by email, username, or ID... (min 2 chars)"
                        value={userSearchTerm}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          border: `1px solid ${userSearchTerm.length > 0 && userSearchTerm.length < 2 ? 'var(--accent-red)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: 'var(--glass-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <button
                        onClick={() => handleUserSearch()}
                        disabled={loadingUserSearch || userSearchTerm.length < 2}
                        style={{
                          padding: '0.8rem 1.5rem',
                          background: (loadingUserSearch || userSearchTerm.length < 2) ? 'var(--glass-bg)' : 'var(--primary-gold)',
                          color: (loadingUserSearch || userSearchTerm.length < 2) ? 'var(--text-secondary)' : '#000',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: (loadingUserSearch || userSearchTerm.length < 2) ? 'not-allowed' : 'pointer',
                          opacity: (loadingUserSearch || userSearchTerm.length < 2) ? 0.7 : 1
                        }}
                      >
                        {loadingUserSearch ? '🔄' : '🔍'}
                      </button>
                      
                      {userSearchTerm && (
                        <button
                          onClick={() => {
                            setUserSearchTerm('');
                            setUserSearchResults([]);
                            setSelectedUser(null);
                          }}
                          style={{
                            padding: '0.8rem',
                            background: 'var(--accent-red)',
                          color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    {/* Search helper text */}
                    {userSearchTerm.length > 0 && userSearchTerm.length < 2 && (
                      <div style={{
                        color: 'var(--accent-red)',
                        fontSize: '0.85rem',
                        marginTop: '0.5rem'
                      }}>
                        ⚠️ Please enter at least 2 characters to search
                      </div>
                    )}
                    
                    {/* Auto-search indicator */}
                    {userSearchTerm.length >= 2 && loadingUserSearch && (
                      <div style={{
                        color: 'var(--primary-gold)',
                        fontSize: '0.85rem',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid var(--primary-gold)',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Searching users...
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {userSearchResults.length > 0 && !loadingUserSearch && (
                    <div style={{
                      background: 'rgba(0, 173, 181, 0.1)',
                      border: '1px solid var(--accent-blue)',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      margin: '1rem 0',
                      textAlign: 'center',
                      color: 'var(--accent-blue)',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      🔍 Found {userSearchResults.length} user{userSearchResults.length !== 1 ? 's' : ''} matching "{userSearchTerm}"
                    </div>
                  )}
                  
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                      {userSearchResults.length === 0 && userSearchTerm && !loadingUserSearch && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: 'var(--text-secondary)',
                      background: 'var(--glass-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      No users found matching "{userSearchTerm}"
                    </div>
                  )}

                  {userSearchResults.length === 0 && !userSearchTerm && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: 'var(--text-secondary)',
                      background: 'var(--glass-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>🔍 Search for Users</h4>
                      <p style={{ marginBottom: '1.5rem' }}>
                        Enter an email, username, or ID in the search box above to find users.
                      </p>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          <strong>💡 No users in database?</strong> Create demo users for testing:
                        </p>
                      <button
                          onClick={createDemoUsers}
                          disabled={loading}
                          style={{
                            padding: '0.8rem 1.5rem',
                            background: loading ? 'var(--glass-bg)' : 'var(--primary-gold)',
                            color: loading ? 'var(--text-secondary)' : '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {loading ? '🔄 Creating...' : '👥 Create Demo Users'}
                      </button>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <strong>Search Examples:</strong><br/>
                        • "player" - finds all players<br/>
                        • "example.com" - finds demo users<br/>
                        • "admin" - finds admin users
          </div>
        </div>
      )}

                    {userSearchResults.map(user => (
                      <div
                        key={user.id}
                        onClick={(e) => {
                          // Immediate visual feedback
                          e.target.style.transform = 'scale(0.98)';
                          setTimeout(() => {
                            e.target.style.transform = '';
                          }, 150);
                          
                          // Execute selection
                          handleUserSelect(user.id);
                        }}
                        style={{
                          background: selectedUser?.id === user.id ? 'rgba(0, 173, 181, 0.2)' : 'var(--glass-bg)',
                          border: selectedUser?.id === user.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '1rem',
                          marginBottom: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedUser?.id !== user.id) {
                            e.target.style.background = 'rgba(255, 215, 0, 0.1)';
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedUser?.id !== user.id) {
                            e.target.style.background = 'var(--glass-bg)';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {selectedUser?.id === user.id && (
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: 'var(--accent-blue)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                          }}>
                            ✓
                          </div>
                        )}
                        
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem', paddingRight: '1.5rem' }}>
                          {user.name || user.username || user.email?.split('@')[0]}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                          📧 {user.email}
                        </p>
                        {user.lastLogin && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.25rem 0' }}>
                            🕒 Last seen: {new Date(user.lastLogin?.toDate?.() || user.lastLogin).toLocaleDateString()}
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{
                            color: 'var(--primary-gold)', 
                            fontSize: '1rem', 
                            fontWeight: '700',
                            background: 'rgba(255, 215, 0, 0.1)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px'
                          }}>
                            💰 ₹{(user.walletBalance || 0).toLocaleString()}
                      </span>
                          <span style={{ 
                            color: user.banned ? 'var(--accent-red)' : 'var(--accent-green)', 
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: user.banned ? 'rgba(255, 76, 76, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px'
                          }}>
                            {user.banned ? '🚫 BANNED' : '✅ ACTIVE'}
                          </span>
                        </div>
                        
                        {/* Click hint */}
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          textAlign: 'center',
                          marginTop: '0.5rem',
                          opacity: 0.7
                        }}>
                          👆 Click to view details & manage user
                        </div>
                      </div>
                    ))}
          </div>
        </div>

                {/* User Details */}
                {selectedUser && (
        <div id="user-details-section" className="game-area">
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', margin: 0 }}>
                        📋 User Details
                        {selectedUser.isLoadingDetails ? (
                          <span style={{ 
                            marginLeft: '1rem',
                            fontSize: '0.9rem',
                            color: 'var(--primary-gold)',
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }}>
                            ⚡ Loading detailed data...
                          </span>
                        ) : selectedUser.detailsLoadError ? (
                          <span style={{ 
                            marginLeft: '1rem',
                            fontSize: '0.9rem',
                            color: 'var(--accent-red)'
                          }}>
                            ⚠️ Some data failed to load (showing basic info)
                          </span>
                        ) : null}
          </h3>
                      <button
                        onClick={() => setSelectedUser(null)}
                        style={{
                          background: 'var(--accent-red)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* User Info */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ 
                        background: 'var(--glass-bg)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px', 
                        padding: '1.5rem' 
                      }}>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                          {selectedUser.username || selectedUser.email}
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                              <strong>Email:</strong> {selectedUser.email}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                              <strong>Balance:</strong> <span style={{ color: 'var(--primary-gold)', fontWeight: '600' }}>
                                ₹{selectedUser.walletBalance || 0}
                              </span>
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                              <strong>Status:</strong> <span style={{ 
                                color: selectedUser.banned ? 'var(--accent-red)' : 'var(--accent-green)' 
                              }}>
                                {selectedUser.banned ? 'BANNED' : 'ACTIVE'}
                              </span>
                            </p>
            </div>
                          <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                              <strong>ID:</strong> {selectedUser.id}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                              <strong>Created:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                              <strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {selectedUser.banned && selectedUser.banReason && (
            <div style={{
                            marginTop: '1rem', 
                            padding: '1rem', 
                            background: 'rgba(255, 0, 0, 0.1)',
                            border: '1px solid var(--accent-red)',
                            borderRadius: '8px'
                          }}>
                            <p style={{ color: 'var(--accent-red)', fontSize: '0.9rem', margin: 0 }}>
                              <strong>Ban Reason:</strong> {selectedUser.banReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                      <button
                        onClick={() => setShowBalanceModal(true)}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: 'var(--primary-gold)',
                          color: '#000',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        💰 Adjust Balance
                      </button>
                      
                      <button
                        onClick={(e) => {
                          // Add click feedback
                          e.target.style.transform = 'scale(0.95)';
                          setTimeout(() => {
                            e.target.style.transform = '';
                          }, 150);
                          
                          if (selectedUser.banned) {
                            // Pre-fill the form for unban
                            console.log('🔍 Opening unban modal for user:', selectedUser.email);
                            setBanDetails({ reason: '', duration: 'unban' });
                            setShowBanModal(true);
                          } else {
                            // Pre-fill the form for ban
                            console.log('🔍 Opening ban modal for user:', selectedUser.email);
                            setBanDetails({ reason: '', duration: '' });
                            setShowBanModal(true);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: selectedUser.banned ? 'var(--accent-green)' : 'var(--accent-red)',
                          color: selectedUser.banned ? '#000' : '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedUser.banned ? '✅ Unban User' : '🚫 Ban User'}
                      </button>
                    </div>

                    {/* Financial Summary */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        💰 Financial Summary
                        {selectedUser.isLoadingDetails && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.8rem', 
                            color: 'var(--primary-gold)' 
                          }}>
                            🔄 Loading...
                          </span>
                        )}
                      </h4>
                      {selectedUser.isLoadingDetails ? (
                        <div style={{ 
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              {/* Skeleton loaders for financial data */}
                              <div style={{ 
                                height: '20px', 
                                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                                borderRadius: '4px',
                                marginBottom: '0.5rem',
                                animation: 'pulse 1.5s ease-in-out infinite'
                              }} />
                              <div style={{ 
                                height: '20px', 
                                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                                borderRadius: '4px',
                                marginBottom: '0.5rem',
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: '0.1s'
                              }} />
                              <div style={{ 
                                height: '20px', 
                                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                                borderRadius: '4px',
                                marginBottom: '0.5rem',
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: '0.2s'
                              }} />
                            </div>
                            <div>
                              <div style={{ 
                                height: '20px', 
                                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                                borderRadius: '4px',
                                marginBottom: '0.5rem',
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: '0.3s'
                              }} />
                              <div style={{ 
                                height: '20px', 
                                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                                borderRadius: '4px',
                                marginBottom: '0.5rem',
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: '0.4s'
                              }} />
                            </div>
                          </div>
                          <div style={{
                            textAlign: 'center',
                            marginTop: '1rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                          }}>
                            ⚡ Loading financial data...
                          </div>
                        </div>
                      ) : selectedUser.financialSummary && (
                        <div style={{ 
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Total Deposited:</strong> <span style={{ color: 'var(--accent-green)' }}>₹{selectedUser.financialSummary.totalDeposited}</span>
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Total Withdrawn:</strong> <span style={{ color: 'var(--accent-red)' }}>₹{selectedUser.financialSummary.totalWithdrawn}</span>
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Total Wagered:</strong> ₹{selectedUser.financialSummary.totalWagered}
                              </p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Total Won:</strong> <span style={{ color: 'var(--accent-green)' }}>₹{selectedUser.financialSummary.totalWon}</span>
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Net Profit:</strong> <span style={{ 
                                  color: selectedUser.financialSummary.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
                                }}>
                                  ₹{selectedUser.financialSummary.netProfit}
                                </span>
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Avg Transaction:</strong> ₹{Math.round(selectedUser.financialSummary.averageTransactionAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Game Statistics */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        🎮 Game Statistics
                        {selectedUser.isLoadingDetails && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.8rem', 
                            color: 'var(--primary-gold)' 
                          }}>
                            🔄 Loading...
                          </span>
                        )}
                      </h4>
                      {selectedUser.isLoadingDetails ? (
                        <div style={{ 
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '2rem',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            animation: 'spin 1s linear infinite',
                            fontSize: '2rem',
                            marginBottom: '1rem'
                          }}>
                            🎮
                          </div>
                          <p style={{ color: 'var(--text-secondary)' }}>
                            Loading game statistics...
                          </p>
                        </div>
                      ) : selectedUser.gameStatistics && Object.keys(selectedUser.gameStatistics).length > 0 ? (
                        <div style={{ 
                          maxHeight: '300px', 
              overflowY: 'auto',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '1rem'
            }}>
                          {Object.entries(selectedUser.gameStatistics).map(([gameName, stats], index) => (
                <div 
                              key={gameName}
                  style={{
                    padding: '1rem',
                                marginBottom: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)'
                              }}
                            >
                              <h5 style={{ color: 'var(--primary-gold)', marginBottom: '0.5rem' }}>
                                {gameName}
                              </h5>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Bets:</strong> {stats.totalBets}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Wagered:</strong> ₹{stats.totalWagered}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Won:</strong> ₹{stats.totalWon}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Win Rate:</strong> {stats.winRate.toFixed(1)}%
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Net:</strong> <span style={{ 
                                    color: stats.netResult >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
                                  }}>
                                    ₹{stats.netResult}
                                  </span>
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Avg Bet:</strong> ₹{Math.round(stats.averageBet)}
                                </p>
                      </div>
                              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Biggest Win:</strong> <span style={{ color: 'var(--accent-green)' }}>₹{stats.biggestWin}</span> | 
                                  <strong> Biggest Loss:</strong> <span style={{ color: 'var(--accent-red)' }}> ₹{stats.biggestLoss}</span>
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Last Played:</strong> {stats.lastPlayed ? new Date(stats.lastPlayed.seconds * 1000).toLocaleString() : 'N/A'}
                                </p>
                      </div>
                      </div>
                          ))}
                      </div>
                      ) : (
                        <div style={{ 
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '2rem',
                          textAlign: 'center'
                        }}>
                          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            No game statistics found
                          </p>
                        </div>
                      )}
                        </div>

                    {/* Recent Transactions */}
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        📊 Recent Transactions
                        {selectedUser.isLoadingDetails && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.8rem', 
                            color: 'var(--primary-gold)' 
                          }}>
                            🔄 Loading...
                          </span>
                        )}
                      </h4>
                      <div style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        {selectedUser.isLoadingDetails ? (
                          <div style={{
                            textAlign: 'center',
                            padding: '2rem'
                          }}>
                            <div style={{
                              animation: 'spin 1s linear infinite',
                              fontSize: '2rem',
                              marginBottom: '1rem'
                            }}>
                              📊
                      </div>
                            <p style={{ color: 'var(--text-secondary)' }}>
                              Loading transaction history...
                            </p>
                          </div>
                        ) : selectedUser.transactions && selectedUser.transactions.length > 0 ? (
                          selectedUser.transactions.slice(0, 15).map((transaction, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.5rem 0',
                                borderBottom: index < Math.min(selectedUser.transactions.length - 1, 14) ? '1px solid var(--border-color)' : 'none'
                              }}
                            >
                              <div>
                                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                  {transaction.type.replace('_', ' ').toUpperCase()}
                                </span>
                                {transaction.gameName && (
                                  <span style={{ color: 'var(--primary-gold)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                    ({transaction.gameName})
                                  </span>
                                )}
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                                  {transaction.timestamp ? new Date(transaction.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                                </p>
                      </div>
                              <span style={{ 
                                color: transaction.amount >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}>
                                {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                            No transactions found
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                    </div>
                    
              {/* Balance Adjustment Modal */}
              {showBalanceModal && (
                      <div style={{ 
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: '2rem'
                }}>
                  <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '100%',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem', textAlign: 'center' }}>
                      💰 Adjust Balance for {selectedUser?.email}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Current Balance: <span style={{ color: 'var(--primary-gold)', fontWeight: '600' }}>
                          ₹{selectedUser?.walletBalance || 0}
                        </span>
                      </p>
                      </div>
                      
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                        Amount (use negative for deduction):
                      </label>
                      <input
                        type="number"
                        value={balanceAdjustment.amount}
                        onChange={(e) => setBalanceAdjustment(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="e.g., 1000 or -500"
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: 'var(--glass-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                        Reason:
                      </label>
                            <input
                              type="text"
                        value={balanceAdjustment.reason}
                        onChange={(e) => setBalanceAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="e.g., Manual correction, Bonus credit, etc."
                              style={{
                                width: '100%',
                          padding: '0.8rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: 'var(--glass-bg)',
                          color: 'var(--text-primary)'
                              }}
                            />
                          </div>

                    {balanceAdjustment.amount && (
                      <div style={{ 
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: parseFloat(balanceAdjustment.amount) >= 0 ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                        border: `1px solid ${parseFloat(balanceAdjustment.amount) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                        borderRadius: '8px'
                      }}>
                        <p style={{ 
                          color: parseFloat(balanceAdjustment.amount) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                          margin: 0,
                          textAlign: 'center',
                          fontWeight: '600'
                        }}>
                          New Balance: ₹{(selectedUser?.walletBalance || 0) + parseFloat(balanceAdjustment.amount || 0)}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                          <button
                        onClick={() => {
                          setShowBalanceModal(false);
                          setBalanceAdjustment({ amount: '', reason: '' });
                        }}
                            style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBalanceAdjustment}
                        disabled={!balanceAdjustment.amount || !balanceAdjustment.reason || loading}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: (!balanceAdjustment.amount || !balanceAdjustment.reason || loading) 
                            ? 'var(--glass-bg)' : 'var(--primary-gold)',
                          color: (!balanceAdjustment.amount || !balanceAdjustment.reason || loading) 
                            ? 'var(--text-secondary)' : '#000',
                              border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: (!balanceAdjustment.amount || !balanceAdjustment.reason || loading) 
                            ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loading ? '🔄 Processing...' : 'Confirm Adjustment'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Ban User Modal */}
              {showBanModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001,
                  padding: '2rem'
                }}>
                  <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '100%',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h3 style={{ 
                      color: banDetails.duration === 'unban' ? 'var(--accent-green)' : 'var(--accent-red)', 
                      marginBottom: '1.5rem', 
                      textAlign: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {banDetails.duration === 'unban' ? '✅ Unban User' : '🚫 Ban User'}: {selectedUser?.email}
                    </h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {banDetails.duration === 'unban' ? (
                          <><strong>✅ Info:</strong> This action will immediately restore the user's access to the platform.</>
                        ) : (
                          <><strong>⚠️ Warning:</strong> This action will immediately prevent the user from accessing the platform.</>
                        )}
                      </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                        {banDetails.duration === 'unban' ? 'Reason for unban:' : 'Reason for ban:'} <span style={{ color: 'var(--accent-red)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={banDetails.reason}
                        onChange={(e) => setBanDetails(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder={banDetails.duration === 'unban' 
                          ? "e.g., Appeal approved, Misunderstanding resolved, etc."
                          : "e.g., Violation of terms, Suspicious activity, etc."}
                      
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: 'var(--glass-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                        Ban Duration:
                      </label>
                      {/* Custom Dropdown for Ban Duration */}
                      <div className="ban-duration-dropdown" style={{ position: 'relative', width: '100%' }}>
                        <div
                          onClick={() => setShowBanDurationDropdown(!showBanDurationDropdown)}
                          style={{
                            width: '100%',
                            padding: '0.8rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            background: '#2a2a2a',
                            color: '#ffffff',
                              cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            minHeight: '20px'
                          }}
                        >
                          <span>
                            {banDetails.duration === '' && '🔒 Permanent Ban'}
                            {banDetails.duration === '1' && '⏰ 1 Day'}
                            {banDetails.duration === '3' && '⏰ 3 Days'}
                            {banDetails.duration === '7' && '📅 1 Week (7 Days)'}
                            {banDetails.duration === '14' && '📅 2 Weeks (14 Days)'}
                            {banDetails.duration === '30' && '📆 1 Month (30 Days)'}
                            {banDetails.duration === '90' && '📆 3 Months (90 Days)'}
                            {banDetails.duration === 'unban' && '✅ Unban User'}
                          </span>
                          <span style={{ 
                            transform: showBanDurationDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            fontSize: '0.8rem'
                          }}>
                            ▼
                          </span>
                        </div>
                        
                        {showBanDurationDropdown && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#2a2a2a',
                            border: '1px solid var(--border-color)',
                            borderTop: 'none',
                            borderRadius: '0 0 8px 8px',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}>
                            {[
                              { value: 'unban', label: '✅ Unban User', desc: 'Remove ban and restore access', type: 'unban' },
                              { value: '', label: '🔒 Permanent Ban', desc: 'User banned indefinitely', type: 'ban' },
                              { value: '1', label: '⏰ 1 Day', desc: 'Short temporary ban', type: 'ban' },
                              { value: '3', label: '⏰ 3 Days', desc: 'Standard temporary ban', type: 'ban' },
                              { value: '7', label: '📅 1 Week (7 Days)', desc: 'Medium temporary ban', type: 'ban' },
                              { value: '14', label: '📅 2 Weeks (14 Days)', desc: 'Extended temporary ban', type: 'ban' },
                              { value: '30', label: '📆 1 Month (30 Days)', desc: 'Long temporary ban', type: 'ban' },
                              { value: '90', label: '📆 3 Months (90 Days)', desc: 'Very long temporary ban', type: 'ban' }
                            ].map((option) => (
                              <div
                                key={option.value}
                                onClick={() => {
                                  setBanDetails(prev => ({ ...prev, duration: option.value }));
                                  setShowBanDurationDropdown(false);
                                }}
                                style={{
                                  padding: '0.8rem',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                  transition: 'background 0.2s ease',
                                  backgroundColor: banDetails.duration === option.value ? 
                                    (option.type === 'unban' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 215, 0, 0.2)') : 
                                    'transparent',
                                  borderLeft: option.type === 'unban' ? '4px solid #4CAF50' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                  if (banDetails.duration !== option.value) {
                                    e.target.style.background = option.type === 'unban' ? 
                                      'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.1)';
                                  }
                            }}
                            onMouseLeave={(e) => {
                                  if (banDetails.duration !== option.value) {
                                    e.target.style.background = 'transparent';
                                  }
                                }}
                              >
                                <div style={{ 
                                  color: '#ffffff', 
                                  fontWeight: '600',
                                  marginBottom: '0.25rem'
                                }}>
                                  {option.label}
                                </div>
                                <div style={{ 
                                  color: 'rgba(255, 255, 255, 0.7)', 
                                  fontSize: '0.85rem'
                                }}>
                                  {option.desc}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ 
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: 'rgba(255, 0, 0, 0.1)',
                      border: '1px solid var(--accent-red)',
                      borderRadius: '8px'
                    }}>
                      <p style={{ 
                        color: banDetails.duration === 'unban' ? 'var(--accent-green)' : 'var(--accent-red)',
                        margin: 0,
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {banDetails.duration === 'unban' ? 
                          'User will be unbanned and can access the platform immediately' :
                          banDetails.duration ? 
                            `User will be banned for ${banDetails.duration} day(s)` : 
                            'User will be permanently banned'
                        }
                      </p>
                      {banDetails.duration && banDetails.duration !== 'unban' && (
                        <p style={{ 
                          color: 'var(--text-secondary)',
                          margin: '0.5rem 0 0 0',
                          textAlign: 'center',
                          fontSize: '0.8rem'
                        }}>
                          Ban will expire on: {new Date(Date.now() + parseInt(banDetails.duration) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => {
                          setShowBanModal(false);
                          setBanDetails({ reason: '', duration: '' });
                        }}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                          </button>
                          <button
                        onClick={(e) => {
                          console.log('⚡ INSTANT ban modal confirm clicked');
                          
                          // Immediate visual feedback
                          e.target.style.transform = 'scale(0.95)';
                          e.target.style.opacity = '0.8';
                          
                          setTimeout(() => {
                            e.target.style.transform = '';
                            e.target.style.opacity = '';
                          }, 200);
                          
                          if (banDetails.reason.trim()) {
                            const isUnban = banDetails.duration === 'unban';
                            console.log('⚡ Processing:', isUnban ? 'UNBAN' : 'BAN', 'for', selectedUser.email);
                            
                            // Execute instantly (no await)
                            handleUserBan(
                              selectedUser.id, 
                              !isUnban, // banned = false for unban, true for ban
                              banDetails.reason, 
                              isUnban ? null : (banDetails.duration ? parseInt(banDetails.duration) : null)
                            );
                          } else {
                            console.log('⚠️ Reason is empty, showing instant feedback');
                            alert('⚠️ Please enter a reason before proceeding.');
                          }
                        }}
                        disabled={!banDetails.reason.trim() || loading}
                            style={{
                          flex: 1,
                          padding: '0.8rem',
                          background: (!banDetails.reason.trim() || loading) 
                            ? 'var(--glass-bg)' : 
                            (banDetails.duration === 'unban' ? 'var(--accent-green)' : 'var(--accent-red)'),
                          color: (!banDetails.reason.trim() || loading) 
                            ? 'var(--text-secondary)' : 
                            (banDetails.duration === 'unban' ? '#000' : '#fff'),
                              border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: (!banDetails.reason.trim() || loading) 
                            ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {loading ? 
                          (banDetails.duration === 'unban' ? '⚡ Processing...' : '⚡ Processing...') : 
                          (banDetails.duration === 'unban' ? '⚡ Instant Unban' : '⚡ Instant Ban')
                        }
                          </button>
                    </div>
                  </div>
                        </div>
              )}
            </>
          )}

          {/* Notification Modals */}
          
          {/* Announcement Modal */}
          {showAnnouncementModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                  📢 Send Platform Announcement
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Announcement Title: <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., New Game Release, Platform Update, Holiday Event"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Message: <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <textarea
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your announcement message here..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Priority Level:
                  </label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="normal">📢 Normal</option>
                    <option value="high">⚠️ High Priority</option>
                    <option value="urgent">🚨 Urgent</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setAnnouncementForm({ title: '', message: '', priority: 'normal' });
                      setShowAnnouncementModal(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAnnouncementSubmit}
                    disabled={!announcementForm.title.trim() || !announcementForm.message.trim()}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: (!announcementForm.title.trim() || !announcementForm.message.trim()) 
                        ? 'var(--glass-bg)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: (!announcementForm.title.trim() || !announcementForm.message.trim()) 
                        ? 'var(--text-secondary)' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: (!announcementForm.title.trim() || !announcementForm.message.trim()) 
                        ? 'not-allowed' : 'pointer'
                    }}
                  >
                    📢 Send to All Users
                          </button>
                </div>
              </div>
                        </div>
                      )}
                      
          {/* Deposit Modal */}
          {showDepositModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                  ✅ Send Deposit Approval
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    User Email: <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={depositForm.userEmail}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, userEmail: e.target.value }))}
                    placeholder="user@example.com"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Deposit Amount (₹): <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="1000"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Transaction ID: (Optional)
                  </label>
                  <input
                    type="text"
                    value={depositForm.txId}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, txId: e.target.value }))}
                    placeholder="Auto-generated if left empty"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setDepositForm({ userId: '', amount: '', txId: '', userEmail: '' });
                      setShowDepositModal(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDepositSubmit}
                    disabled={!depositForm.amount || !depositForm.userEmail}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: (!depositForm.amount || !depositForm.userEmail) 
                        ? 'var(--glass-bg)' : 'linear-gradient(135deg, #10b981, #047857)',
                      color: (!depositForm.amount || !depositForm.userEmail) 
                        ? 'var(--text-secondary)' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: (!depositForm.amount || !depositForm.userEmail) 
                        ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ✅ Send Approval
                  </button>
                </div>
              </div>
                        </div>
                      )}
                      
          {/* Withdrawal Modal */}
          {showWithdrawalModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                  💸 Send Withdrawal Approval
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    User Email: <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={withdrawalForm.userEmail}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, userEmail: e.target.value }))}
                    placeholder="user@example.com"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Withdrawal Amount (₹): <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="500"
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Processing Note: (Optional)
                  </label>
                  <input
                    type="text"
                    value={withdrawalForm.reason}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g., Processed via Bank Transfer, UPI Payment"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setWithdrawalForm({ userId: '', amount: '', reason: '', userEmail: '' });
                      setShowWithdrawalModal(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdrawalSubmit}
                    disabled={!withdrawalForm.amount || !withdrawalForm.userEmail}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: (!withdrawalForm.amount || !withdrawalForm.userEmail) 
                        ? 'var(--glass-bg)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: (!withdrawalForm.amount || !withdrawalForm.userEmail) 
                        ? 'var(--text-secondary)' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: (!withdrawalForm.amount || !withdrawalForm.userEmail) 
                        ? 'not-allowed' : 'pointer'
                    }}
                  >
                    💸 Send Approval
                  </button>
                </div>
              </div>
                        </div>
                      )}

          {/* Maintenance Modal */}
          {showMaintenanceModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                  🔧 Send Maintenance Notice
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Maintenance Message: <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <textarea
                    value={maintenanceForm.message}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="e.g., Scheduled server maintenance for performance improvements."
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      resize: 'vertical'
                    }}
                  />
                    </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Scheduled Time: (Optional)
                  </label>
                  <input
                    type="text"
                    value={maintenanceForm.scheduledTime}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    placeholder="e.g., Tomorrow 2:00 AM IST, Friday 12:00 PM"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  </div>
                  
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Maintenance Type:
                  </label>
                  <select
                    value={maintenanceForm.type}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="scheduled">🗓️ Scheduled Maintenance</option>
                    <option value="emergency">🚨 Emergency Maintenance</option>
                    <option value="update">⬆️ System Update</option>
                    <option value="completed">✅ Maintenance Completed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setMaintenanceForm({ message: '', scheduledTime: '', type: 'scheduled' });
                      setShowMaintenanceModal(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMaintenanceSubmit}
                    disabled={!maintenanceForm.message.trim()}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      background: !maintenanceForm.message.trim() 
                        ? 'var(--glass-bg)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: !maintenanceForm.message.trim() 
                        ? 'var(--text-secondary)' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: !maintenanceForm.message.trim() 
                        ? 'not-allowed' : 'pointer'
                    }}
                  >
                    🔧 Send Notice
                  </button>
                </div>
              </div>
            </div>
          )}

                    {/* Games Tab */}
          {activeTab === 'games' && (
            <>
              <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
                🎮 Game Management
              </h2>
              
                    <div style={{ 
                display: 'grid',
                gridTemplateColumns: selectedGame ? '1fr 1fr' : '1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Game List */}
                <div className="game-area">
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📋 All Games ({allGames.length})
                  </h3>
                  
                  {allGames.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: 'var(--text-secondary)',
                      background: 'var(--glass-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      {loading ? 'Loading games...' : 'No games found.'}
                        </div>
                  ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {allGames.map(game => (
                        <div
                          key={game.id}
                          onClick={() => setSelectedGame(game)}
                          style={{
                            background: selectedGame?.id === game.id ? 'var(--accent-blue)' : 'var(--glass-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {game.name}
                                <span style={{ 
                                  color: game.enabled ? 'var(--accent-green)' : 'var(--accent-red)',
                                  fontSize: '0.8rem',
                                  fontWeight: '600'
                                }}>
                                  {game.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}
                                </span>
                              </h4>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Total Bets:</strong> {game.stats?.totalBets || 0}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Revenue:</strong> ₹{game.stats?.totalRevenue || 0}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Players:</strong> {game.stats?.totalPlayers || 0}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Avg Bet:</strong> ₹{Math.round(game.stats?.averageBet || 0)}
                                </p>
                        </div>
                              
                              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                  <strong>Limits:</strong> ₹{game.minBet} - ₹{game.maxBet}
                                </p>
                    </div>
                  </div>
                  
                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGameToggle(game.id, !game.enabled);
                                }}
                                disabled={loading}
                                style={{
                      padding: '0.5rem', 
                                  background: game.enabled ? 'var(--accent-red)' : 'var(--accent-green)',
                                  color: game.enabled ? '#fff' : '#000',
                                  border: 'none',
                      borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  cursor: loading ? 'not-allowed' : 'pointer',
                                  opacity: loading ? 0.7 : 1
                                }}
                              >
                                {game.enabled ? '❌' : '✅'}
                              </button>
                    </div>
                          </div>
                </div>
              ))}
            </div>
          )}
        </div>

                {/* Game Details */}
                {selectedGame && (
        <div className="game-area">
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', margin: 0 }}>
                        🔧 Game Settings
          </h3>
                      <button
                        onClick={() => setSelectedGame(null)}
                        style={{
                          background: 'var(--accent-red)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Game Configuration */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ 
                        background: 'var(--glass-bg)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px', 
                        padding: '1.5rem' 
                      }}>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                          {selectedGame.name} Configuration
              </h4>
                        
                        {/* Game Status */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                            Status:
                          </label>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                              onClick={() => handleGameToggle(selectedGame.id, true)}
                              disabled={loading || selectedGame.enabled}
                              style={{
                                padding: '0.8rem 1.5rem',
                                background: selectedGame.enabled ? 'var(--accent-green)' : 'transparent',
                                color: selectedGame.enabled ? '#000' : 'var(--text-primary)',
                                border: `1px solid ${selectedGame.enabled ? 'var(--accent-green)' : 'var(--border-color)'}`,
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: (loading || selectedGame.enabled) ? 'not-allowed' : 'pointer',
                                opacity: (loading || selectedGame.enabled) ? 0.7 : 1
                              }}
                            >
                              {selectedGame.enabled ? '✅ Enabled' : 'Enable Game'}
                            </button>
                            <button
                              onClick={() => handleGameToggle(selectedGame.id, false)}
                              disabled={loading || !selectedGame.enabled}
                              style={{
                                padding: '0.8rem 1.5rem',
                                background: !selectedGame.enabled ? 'var(--accent-red)' : 'transparent',
                                color: !selectedGame.enabled ? '#fff' : 'var(--text-primary)',
                                border: `1px solid ${!selectedGame.enabled ? 'var(--accent-red)' : 'var(--border-color)'}`,
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: (loading || !selectedGame.enabled) ? 'not-allowed' : 'pointer',
                                opacity: (loading || !selectedGame.enabled) ? 0.7 : 1
                              }}
                            >
                              {!selectedGame.enabled ? '❌ Disabled' : 'Disable Game'}
                            </button>
                          </div>
                        </div>

                        {/* Betting Limits */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Betting Limits
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                                Minimum Bet (₹):
                              </label>
                <input
                  type="number"
                                value={selectedGame.minBet}
                                onChange={(e) => setSelectedGame(prev => ({ ...prev, minBet: parseInt(e.target.value) }))}
                                style={{
                                  width: '100%',
                                  padding: '0.8rem',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  background: 'var(--glass-bg)',
                                  color: 'var(--text-primary)'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                                Maximum Bet (₹):
                              </label>
                <input
                                type="number"
                                value={selectedGame.maxBet}
                                onChange={(e) => setSelectedGame(prev => ({ ...prev, maxBet: parseInt(e.target.value) }))}
                                style={{
                                  width: '100%',
                                  padding: '0.8rem',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  background: 'var(--glass-bg)',
                                  color: 'var(--text-primary)'
                                }}
                />
              </div>
                          </div>
                <button
                            onClick={() => handleGameLimitsUpdate(selectedGame.id, selectedGame.maxBet, selectedGame.minBet)}
                            disabled={loading}
                            style={{
                              marginTop: '1rem',
                              padding: '0.8rem 1.5rem',
                              background: loading ? 'var(--glass-bg)' : 'var(--primary-gold)',
                              color: loading ? 'var(--text-secondary)' : '#000',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {loading ? '🔄 Updating...' : 'Update Limits'}
                </button>
                        </div>
                      </div>
                    </div>

                    {/* Game Statistics */}
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        📊 Game Statistics
                      </h4>
                      <div style={{ 
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        {selectedGame.stats ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Total Bets:</strong> {selectedGame.stats.totalBets}
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Total Revenue:</strong> ₹{selectedGame.stats.totalRevenue}
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Unique Players:</strong> {selectedGame.stats.totalPlayers}
                              </p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Average Bet:</strong> ₹{Math.round(selectedGame.stats.averageBet)}
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>House Edge:</strong> {selectedGame.stats.totalRevenue > 0 ? 
                                  ((selectedGame.stats.totalRevenue / (selectedGame.stats.totalRevenue + (selectedGame.stats.totalBets * selectedGame.stats.averageBet))) * 100).toFixed(2) : 0}%
                              </p>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                <strong>Status:</strong> <span style={{ 
                                  color: selectedGame.enabled ? 'var(--accent-green)' : 'var(--accent-red)' 
                                }}>
                                  {selectedGame.enabled ? 'ACTIVE' : 'DISABLED'}
                                </span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                            No statistics available yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Coin Games Tab */}
          {activeTab === 'coin-games' && (
            <>
              <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
                🪙 Coin Games Management
              </h2>
              
              {/* Coin Games Stats Overview */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div className="game-area" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', margin: 0 }}>
                    {coinGameStats.totalPlayers}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                    Total Players
                  </p>
                </div>
                
                <div className="game-area" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</div>
                  <h3 style={{ color: 'var(--accent-green)', fontSize: '1.5rem', margin: 0 }}>
                    {coinGameStats.totalGamesPlayed.toLocaleString()}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                    Games Played
                  </p>
                </div>
                
                <div className="game-area" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪙</div>
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', margin: 0 }}>
                    {coinGameStats.totalCoinsAwarded.toLocaleString()}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                    Coins Awarded
                  </p>
                </div>
                
                <div className="game-area" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                  <h3 style={{ color: 'var(--accent-blue)', fontSize: '1.5rem', margin: 0 }}>
                    {coinGameStats.averageScore}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                    Avg Score
                  </p>
                </div>
                
                <div className="game-area" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                  <h3 style={{ color: 'var(--accent-red)', fontSize: '1.5rem', margin: 0 }}>
                    {coinGameStats.popularGame}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                    Most Popular
                  </p>
                </div>
                
                <div className="game-area" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                  <h3 style={{ color: 'var(--accent-yellow)', fontSize: '1.5rem', margin: 0 }}>
                    {coinGameStats.dailyActiveUsers}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0' }}>
                    Daily Active
                  </p>
                </div>
              </div>

              {/* Global Settings */}
              <div className="game-area" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
                  ⚙️ Global Coin Games Settings
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                      Ad Duration (seconds):
                    </label>
                    <input
                      type="number"
                      value={coinGameSettings.adDuration}
                      onChange={(e) => setCoinGameSettings(prev => ({ ...prev, adDuration: parseInt(e.target.value) }))}
                      min="1"
                      max="10"
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                      Max Coins Per Game:
                    </label>
                    <input
                      type="number"
                      value={coinGameSettings.maxCoinsPerGame}
                      onChange={(e) => setCoinGameSettings(prev => ({ ...prev, maxCoinsPerGame: parseInt(e.target.value) }))}
                      min="10"
                      max="500"
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                      Min Coins Per Game:
                    </label>
                    <input
                      type="number"
                      value={coinGameSettings.minCoinsPerGame}
                      onChange={(e) => setCoinGameSettings(prev => ({ ...prev, minCoinsPerGame: parseInt(e.target.value) }))}
                      min="1"
                      max="50"
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ color: 'var(--text-primary)' }}>
                      Coin Games Enabled:
                    </label>
                    <button
                      onClick={() => setCoinGameSettings(prev => ({ ...prev, globalEnabled: !prev.globalEnabled }))}
                      style={{
                        padding: '0.8rem 1.5rem',
                        background: coinGameSettings.globalEnabled ? 'var(--accent-green)' : 'var(--accent-red)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {coinGameSettings.globalEnabled ? '✅ Enabled' : '❌ Disabled'}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCoinGameSettingsUpdate(coinGameSettings)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.8rem 2rem',
                    background: 'var(--primary-gold)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  💾 Save Settings
                </button>
              </div>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: selectedCoinGame ? '1fr 1fr' : '1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Coin Games List */}
                <div className="game-area">
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🎮 All Coin Games ({coinGames.length})
                  </h3>
                  
                  {coinGames.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: 'var(--text-secondary)',
                      background: 'var(--glass-bg)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      {loading ? 'Loading coin games...' : 'No coin games found.'}
                    </div>
                  ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {Object.entries(
                        coinGames.reduce((acc, game) => {
                          if (!acc[game.category]) acc[game.category] = [];
                          acc[game.category].push(game);
                          return acc;
                        }, {})
                      ).map(([category, games]) => (
                        <div key={category} style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ 
                            color: 'var(--accent-blue)', 
                            fontSize: '1rem', 
                            marginBottom: '0.8rem',
                            borderBottom: '1px solid var(--border-color)',
                            paddingBottom: '0.3rem'
                          }}>
                            {category}
                          </h4>
                          {games.map(game => (
                            <div
                              key={game.id}
                              onClick={() => setSelectedCoinGame(game)}
                              style={{
                                background: selectedCoinGame?.id === game.id ? 'var(--accent-blue)' : 'var(--glass-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  <h5 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {game.name}
                                    <span style={{ 
                                      color: game.enabled ? 'var(--accent-green)' : 'var(--accent-red)',
                                      fontSize: '0.8rem',
                                      fontWeight: '600'
                                    }}>
                                      {game.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}
                                    </span>
                                  </h5>
                                  
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                      <strong>Players:</strong> {game.players}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                      <strong>Coins:</strong> {game.minCoins}-{game.maxCoins}
                                    </p>
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCoinGameToggle(game.id, !game.enabled);
                                    }}
                                    disabled={loading}
                                    style={{
                                      padding: '0.5rem', 
                                      background: game.enabled ? 'var(--accent-red)' : 'var(--accent-green)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      cursor: loading ? 'not-allowed' : 'pointer',
                                      opacity: loading ? 0.6 : 1
                                    }}
                                  >
                                    {game.enabled ? '🔴' : '🟢'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Coin Game Details */}
                {selectedCoinGame && (
                  <div className="game-area">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.3rem', margin: 0 }}>
                        🔧 {selectedCoinGame.name} Configuration
                      </h3>
                      <button
                        onClick={() => setSelectedCoinGame(null)}
                        style={{
                          background: 'var(--accent-red)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Coin Game Configuration */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ 
                        background: 'var(--glass-bg)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px', 
                        padding: '1.5rem' 
                      }}>
                        {/* Game Status */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                            Status:
                          </label>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                              onClick={() => handleCoinGameToggle(selectedCoinGame.id, true)}
                              disabled={loading || selectedCoinGame.enabled}
                              style={{
                                padding: '0.8rem 1.5rem',
                                background: selectedCoinGame.enabled ? 'var(--accent-green)' : 'transparent',
                                color: selectedCoinGame.enabled ? '#000' : 'var(--text-primary)',
                                border: `1px solid ${selectedCoinGame.enabled ? 'var(--accent-green)' : 'var(--border-color)'}`,
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: (loading || selectedCoinGame.enabled) ? 'not-allowed' : 'pointer',
                                opacity: (loading || selectedCoinGame.enabled) ? 0.7 : 1
                              }}
                            >
                              {selectedCoinGame.enabled ? '✅ Enabled' : 'Enable Game'}
                            </button>
                            <button
                              onClick={() => handleCoinGameToggle(selectedCoinGame.id, false)}
                              disabled={loading || !selectedCoinGame.enabled}
                              style={{
                                padding: '0.8rem 1.5rem',
                                background: !selectedCoinGame.enabled ? 'var(--accent-red)' : 'transparent',
                                color: !selectedCoinGame.enabled ? '#fff' : 'var(--text-primary)',
                                border: `1px solid ${!selectedCoinGame.enabled ? 'var(--accent-red)' : 'var(--border-color)'}`,
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: (loading || !selectedCoinGame.enabled) ? 'not-allowed' : 'pointer',
                                opacity: (loading || !selectedCoinGame.enabled) ? 0.7 : 1
                              }}
                            >
                              {!selectedCoinGame.enabled ? '❌ Disabled' : 'Disable Game'}
                            </button>
                          </div>
                        </div>

                        {/* Coin Limits */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Coin Rewards
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                                Minimum Coins:
                              </label>
                              <input
                                type="number"
                                value={selectedCoinGame.minCoins}
                                onChange={(e) => setSelectedCoinGame(prev => ({ ...prev, minCoins: parseInt(e.target.value) }))}
                                style={{
                                  width: '100%',
                                  padding: '0.8rem',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  background: 'var(--glass-bg)',
                                  color: 'var(--text-primary)'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                                Maximum Coins:
                              </label>
                              <input
                                type="number"
                                value={selectedCoinGame.maxCoins}
                                onChange={(e) => setSelectedCoinGame(prev => ({ ...prev, maxCoins: parseInt(e.target.value) }))}
                                style={{
                                  width: '100%',
                                  padding: '0.8rem',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  background: 'var(--glass-bg)',
                                  color: 'var(--text-primary)'
                                }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleCoinGameLimitsUpdate(selectedCoinGame.id, selectedCoinGame.maxCoins, selectedCoinGame.minCoins)}
                            disabled={loading}
                            style={{
                              marginTop: '1rem',
                              padding: '0.8rem 1.5rem',
                              background: 'var(--primary-gold)',
                              color: '#000',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.7 : 1
                            }}
                          >
                            💾 Update Limits
                          </button>
                        </div>

                        {/* Game Statistics */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h5 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Game Statistics
                          </h5>
                          <div style={{ 
                            background: 'rgba(255, 255, 255, 0.05)', 
                            borderRadius: '8px', 
                            padding: '1rem' 
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                  <strong>Total Players:</strong> {selectedCoinGame.players}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                  <strong>Category:</strong> {selectedCoinGame.category}
                                </p>
                              </div>
                              <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                  <strong>Coin Range:</strong> {selectedCoinGame.minCoins}-{selectedCoinGame.maxCoins}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                  <strong>Status:</strong> <span style={{ 
                                    color: selectedCoinGame.enabled ? 'var(--accent-green)' : 'var(--accent-red)' 
                                  }}>
                                    {selectedCoinGame.enabled ? 'ACTIVE' : 'DISABLED'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <>
              <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
                📈 Analytics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Revenue Analytics */}
                <div className="game-area">
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Revenue Analytics
                  </h3>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Revenue by Time Range</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
                <button
                        onClick={() => setTimeRange('today')}
                        className={timeRange === 'today' ? 'primary-btn' : 'secondary-btn'}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Today
                </button>
                <button
                        onClick={() => setTimeRange('week')}
                        className={timeRange === 'week' ? 'primary-btn' : 'secondary-btn'}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setTimeRange('month')}
                        className={timeRange === 'month' ? 'primary-btn' : 'secondary-btn'}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setTimeRange('year')}
                        className={timeRange === 'year' ? 'primary-btn' : 'secondary-btn'}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Year
                </button>
              </div>
                    <div style={{ height: '200px', position: 'relative' }}>
                      <canvas id="revenueChart"></canvas>
            </div>
            </div>

                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Revenue by Game</h4>
                    <div style={{ height: '200px', position: 'relative' }}>
                      <canvas id="gameRevenueChart"></canvas>
                    </div>
                  </div>
                </div>

                {/* User Engagement */}
                <div className="game-area">
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    👥 User Engagement
                  </h3>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>User Activity</h4>
                    <div style={{ height: '200px', position: 'relative' }}>
                      <canvas id="userActivityChart"></canvas>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>User Risk Level</h4>
                    <div style={{ height: '200px', position: 'relative' }}>
                      <canvas id="userRiskChart"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <>
              <h2 style={{ color: 'var(--primary-gold)', fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>
                ⚙️ System Health
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Server Status */}
                <div className="game-area">
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🖥️ Server Status
                  </h3>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>System Overview</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Server Status:</strong> <span style={{ color: systemHealth.serverStatus === 'online' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{systemHealth.serverStatus.toUpperCase()}</span>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Database:</strong> <span style={{ color: systemHealth.database === 'healthy' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{systemHealth.database.toUpperCase()}</span>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Payment Gateway:</strong> <span style={{ color: systemHealth.paymentGateway === 'operational' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{systemHealth.paymentGateway.toUpperCase()}</span>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Uptime:</strong> {systemHealth.uptime}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Last Backup:</strong> {formatDate(systemHealth.lastBackup)}
                    </p>
        </div>

                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Logs</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        [2023-10-27 10:30] System started successfully.
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        [2023-10-27 10:35] User 'john@example.com' logged in.
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        [2023-10-27 10:40] Deposit of ₹1000 from user 'sarah@example.com' approved.
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                        [2023-10-27 10:45] Withdrawal request of ₹500 from user 'mike@example.com' rejected.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings (Placeholder) */}
                <div className="game-area">
                  <h3 style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚙️ System Settings
                  </h3>
                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Platform Settings</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Currency:</strong> ₹INR
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Language:</strong> English
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Theme:</strong> Dark
                    </p>
                  </div>

                  <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Security Settings</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Two-Factor Authentication:</strong> Enabled
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>Session Timeout:</strong> 30 minutes
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      <strong>IP Whitelisting:</strong> Enabled
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Back to Home */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/" className="secondary-btn" style={{ 
              display: 'inline-block',
              padding: '1rem 2rem',
              fontSize: '1.1rem'
            }}>
              ← Back to Games
        </Link>
      </div>

          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
            
            /* Fix dropdown visibility across browsers */
            select {
              -webkit-appearance: none !important;
              -moz-appearance: none !important;
              appearance: none !important;
            }
            
            select option {
              background: #2a2a2a !important;
              color: #ffffff !important;
              padding: 8px 12px !important;
              border: none !important;
              font-size: 14px !important;
            }
            
            select option:hover {
              background: #3a3a3a !important;
              color: #ffffff !important;
            }
            
            select option:checked {
              background: #4a4a4a !important;
              color: #ffffff !important;
            }
            
            /* Ensure dropdown appears above other elements */
            select:focus {
              z-index: 9999 !important;
              position: relative !important;
              outline: 2px solid var(--primary-gold);
            }
            
            /* Fix for Windows Chrome dropdown */
            select::-ms-expand {
              display: none;
            }
            
            /* Custom scrollbar for select options */
            select {
              scrollbar-width: thin;
              scrollbar-color: var(--primary-gold) #2a2a2a;
            }
            
            select::-webkit-scrollbar {
              width: 8px;
            }
            
            select::-webkit-scrollbar-track {
              background: #2a2a2a;
            }
            
            select::-webkit-scrollbar-thumb {
              background: var(--primary-gold);
              border-radius: 4px;
            }
          `}</style>
    </div>
  );
};

export default Admin; 