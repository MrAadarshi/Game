import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VirtualCurrencyProvider } from './context/VirtualCurrencyContext';
import { NotificationProvider } from './context/NotificationContext';
import { SoundProvider } from './context/SoundContext';
import { VIPProvider } from './context/VIPContext';
import { RewardsProvider } from './context/RewardsContext';
import { InventoryProvider } from './context/InventoryContext';

// Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import CoinGames from './pages/CoinGames';
import Admin from './pages/Admin';
import Payment from './pages/Payment';
import Rewards from './pages/Rewards';
import Tournaments from './pages/Tournaments';
import VIP from './pages/VIP';
import Withdrawal from './pages/Withdrawal';
import SportsBetting from './pages/SportsBetting';
import Surveys from './pages/Surveys';

// Game components
import MathChallenge from './games/MathChallenge';
import ReactionTime from './games/ReactionTime';
import WordPuzzle from './games/WordPuzzle';
import MemoryMatch from './games/MemoryMatch';
import PatternRecognition from './games/PatternRecognition';
import TriviaQuest from './games/TriviaQuest';

// New monetization components
import PremiumSubscription from './components/PremiumSubscription';
import VirtualStore from './components/VirtualStore';
import VirtualCurrencyPanel from './components/VirtualCurrencyPanel';
import TournamentSystem from './components/TournamentSystem';
import RevenueDashboard from './components/RevenueDashboard';
import ReferralProgram from './components/ReferralProgram';
import InventoryManager from './components/InventoryManager';

// Layout Components  
import Navbar from './components/Navbar';
import DailyBonus from './components/DailyBonus';
import OfflineIndicator from './components/OfflineIndicator';

// Hooks
import { useAuth } from './context/AuthContext';

// CSS
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public Route Component (redirects to home if logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();
  

  
  return (
    <div className="app">
      <OfflineIndicator />
      {user && <Navbar />}
      {user && <DailyBonus />}
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/referrals" element={
          <ProtectedRoute>
            <ReferralProgram />
          </ProtectedRoute>
        } />
        <Route path="/tournaments" element={
          <ProtectedRoute>
            <Tournaments />
          </ProtectedRoute>
        } />
        <Route path="/vip" element={
          <ProtectedRoute>
            <VIP />
          </ProtectedRoute>
        } />
        <Route path="/rewards" element={
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/withdrawal" element={
          <ProtectedRoute>
            <Withdrawal />
          </ProtectedRoute>
        } />
        <Route path="/coin-games" element={<ProtectedRoute><CoinGames /></ProtectedRoute>} />
        <Route path="/virtual-currency" element={
          <ProtectedRoute>
            <VirtualCurrencyPanel />
          </ProtectedRoute>
        } />
        <Route path="/premium" element={
          <ProtectedRoute>
            <PremiumSubscription />
          </ProtectedRoute>
        } />
        <Route path="/store" element={
          <ProtectedRoute>
            <VirtualStore />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <InventoryManager />
          </ProtectedRoute>
        } />
        <Route path="/sports-betting" element={
          <ProtectedRoute>
            <SportsBetting />
          </ProtectedRoute>
        } />
        <Route path="/surveys" element={
          <ProtectedRoute>
            <Surveys />
          </ProtectedRoute>
        } />
        <Route path="/revenue-dashboard" element={
          <ProtectedRoute>
            <RevenueDashboard />
          </ProtectedRoute>
        } />
              
        {/* Teen Engagement Features */}
        <Route path="/shorts" element={
          <ProtectedRoute>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>🎬 Shorts Player</h2>
              <p>Short-form video content for teen engagement</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/social" element={
          <ProtectedRoute>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>👥 Social Hub</h2>
              <p>Connect with other young gamers</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/entertainment" element={
          <ProtectedRoute>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>🎭 Entertainment Zone</h2>
              <p>Fun activities and interactive content</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>🏆 Leaderboard</h2>
              <p>Compete and see your ranking</p>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Skill-based Games */}
        <Route path="/games/math-challenge" element={
          <ProtectedRoute>
            <MathChallenge />
          </ProtectedRoute>
        } />
        <Route path="/games/reaction-time" element={
          <ProtectedRoute>
            <ReactionTime />
          </ProtectedRoute>
        } />
        <Route path="/games/word-puzzle" element={
          <ProtectedRoute>
            <WordPuzzle />
          </ProtectedRoute>
        } />
        <Route path="/games/memory-match" element={
          <ProtectedRoute>
            <MemoryMatch />
          </ProtectedRoute>
        } />
        <Route path="/games/pattern-recognition" element={
          <ProtectedRoute>
            <PatternRecognition />
          </ProtectedRoute>
        } />
        <Route path="/games/trivia-quest" element={
          <ProtectedRoute>
            <TriviaQuest />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <VirtualCurrencyProvider>
          <VIPProvider>
            <RewardsProvider>
              <NotificationProvider>
                <SoundProvider>
                  <InventoryProvider>
                    <AppContent />
                  </InventoryProvider>
                </SoundProvider>
              </NotificationProvider>
            </RewardsProvider>
          </VIPProvider>
        </VirtualCurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 