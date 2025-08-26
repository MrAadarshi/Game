import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const GameHistory = ({ gameId, gameName, maxResults = 10 }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const loadGameHistory = useCallback(async () => {
    if (!user || !showHistory) return;
    
    try {
      setLoading(true);
      setDebugInfo(`Loading game history for: ${gameId}, User: ${user.uid}`);
      console.log('Loading game history for:', gameId, 'User:', user.uid);
      
      const transactionsRef = collection(db, 'transactions');
      
      // First, try to get all transactions for this user and game
      const q = query(
        transactionsRef,
        where('userId', '==', user.uid),
        where('gameId', '==', gameId)
      );
      
      const querySnapshot = await getDocs(q);
      const transactionList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Transaction data:', data);
        transactionList.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      });
      
      // Sort by timestamp manually since we can't use orderBy with compound where
      transactionList.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit results
      const limitedTransactions = transactionList.slice(0, maxResults);
      
      console.log('Found transactions:', limitedTransactions.length);
      setDebugInfo(`Found ${limitedTransactions.length} transactions for ${gameId}`);
      setTransactions(limitedTransactions);
    } catch (error) {
      console.error('Error loading game history:', error);
      setDebugInfo(`Error: ${error.message}`);
      
      // If the compound query fails, try a simpler approach
      try {
        console.log('Trying fallback query...');
        setDebugInfo('Trying fallback query...');
        
        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, where('userId', '==', user.uid));
        
        const querySnapshot = await getDocs(q);
        const transactionList = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.gameId === gameId) {
            transactionList.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate?.() || new Date()
            });
          }
        });
        
        // Sort by timestamp
        transactionList.sort((a, b) => b.timestamp - a.timestamp);
        const limitedTransactions = transactionList.slice(0, maxResults);
        
        console.log('Fallback found transactions:', limitedTransactions.length);
        setDebugInfo(`Fallback found ${limitedTransactions.length} transactions`);
        setTransactions(limitedTransactions);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        setDebugInfo(`Fallback also failed: ${fallbackError.message}`);
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user, gameId, showHistory, maxResults]);

  const testAllTransactions = async () => {
    try {
      setDebugInfo('Testing all transactions...');
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef);
      
      const querySnapshot = await getDocs(q);
      const allTransactions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allTransactions.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      });
      
      setDebugInfo(`Total transactions in DB: ${allTransactions.length}`);
      console.log('All transactions:', allTransactions);
    } catch (error) {
      setDebugInfo(`Error testing all transactions: ${error.message}`);
      console.error('Error testing all transactions:', error);
    }
  };

  useEffect(() => {
    if (user && showHistory) {
      loadGameHistory();
    }
  }, [user, gameId, showHistory, loadGameHistory]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'bet': return '💰';
      case 'win': return '🎉';
      case 'loss': return '💸';
      case 'admin': return '👑';
      default: return '📊';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'bet': return '#FFB400';
      case 'win': return '#00C9A7';
      case 'loss': return '#FF4C4C';
      case 'admin': return '#FFB400';
      default: return '#CCCCCC';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="game-history">
      <button 
        onClick={() => setShowHistory(!showHistory)}
        className="history-toggle-btn"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          width: '100%',
          marginBottom: '1rem'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
        }}
      >
        📊 {showHistory ? 'Hide' : 'Show'} Game History ({transactions.length})
      </button>
      
      {showHistory && (
        <div className="history-panel" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '1.5rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ 
            color: '#FFB400', 
            marginBottom: '1rem', 
            textAlign: 'center',
            fontSize: '1.2rem'
          }}>
            🎮 {gameName} History
          </h4>
          
          {/* Debug Info */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '0.5rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#CCCCCC'
          }}>
            <div>Debug: {debugInfo}</div>
            <button 
              onClick={testAllTransactions}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.7rem',
                color: 'white',
                cursor: 'pointer',
                marginTop: '0.3rem'
              }}
            >
              Test All Transactions
            </button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', color: '#CCCCCC' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              Loading history...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#CCCCCC' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
              No game history yet. Play a game to see your results!
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
                Game ID: {gameId}
              </div>
            </div>
          ) : (
            <div className="history-list" style={{
              maxHeight: '400px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}>
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="history-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))';
                    e.target.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {getTransactionIcon(transaction.type)}
                    </span>
                    <div>
                      <div style={{ 
                        color: getTransactionColor(transaction.type),
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </div>
                      <div style={{ 
                        color: '#CCCCCC', 
                        fontSize: '0.9rem',
                        marginTop: '0.2rem'
                      }}>
                        {formatTime(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    color: getTransactionColor(transaction.type),
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>
                    {transaction.type === 'bet' ? '-' : '+'}{formatAmount(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameHistory; 