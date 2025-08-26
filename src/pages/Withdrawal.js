import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVirtualCurrency } from '../context/VirtualCurrencyContext';

const Withdrawal = () => {
  const { user } = useAuth();
  const { coins, updateVirtualBalance } = useVirtualCurrency();
  const [showBankWithdrawal, setShowBankWithdrawal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
    bankName: ''
  });

  const handleBankWithdrawal = () => {
    // Handle bank withdrawal logic here
    alert('⚠️ Bank withdrawal feature temporarily disabled for legal compliance review. Please use gift card redemptions instead.');
  };

  const formatBalance = (balance) => {
    if (!balance) return '🪙0';
    
    if (balance >= 10000000) { // 1 Cr+
      return `🪙${(balance / 10000000).toFixed(1)}Cr`;
    } else if (balance >= 100000) { // 1L+
      return `🪙${(balance / 100000).toFixed(1)}L`;
    } else if (balance >= 1000) { // 1K+
      return `🪙${(balance / 1000).toFixed(1)}K`;
    } else {
      return `🪙${balance.toLocaleString()}`;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'var(--glass-bg)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: 'var(--text-primary)',
          margin: '0 0 1rem 0',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          💰 Coin Management & Withdrawal
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          margin: '0 0 1.5rem 0',
          fontSize: '1.1rem'
        }}>
          Manage your coins, earn more, and withdraw your earnings
        </p>
        
        {/* Current Balance */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 235, 59, 0.1))',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'inline-block'
        }}>
          <div style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            {formatBalance(coins)} Coins
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            ≈ ₹{((coins || 0) / 100).toFixed(2)} Value
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Rate: 1000 coins = ₹10
          </div>
        </div>
      </div>

      {/* Main Options Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Earn More Coins */}
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{
            fontSize: '3rem',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            💰
          </div>
          
          <h2 style={{
            color: 'var(--text-primary)',
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Earn More Coins
          </h2>
          
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0 0 1.5rem 0',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            Watch ads, play games, complete challenges and earn daily bonuses to increase your coin balance.
          </p>

          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ color: '#22c55e', fontWeight: '600', marginBottom: '0.5rem' }}>
              ⚡ Quick Earning Methods:
            </div>
            <ul style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.2rem' }}>
              <li>Watch ads: +10 coins each</li>
              <li>Daily login: +5 coins</li>
              <li>Play games: Win coins</li>
              <li>Complete challenges: Bonus coins</li>
            </ul>
          </div>

          <Link
            to="/virtual-currency"
            style={{
              display: 'block',
              width: '100%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🚀 Start Earning
          </Link>
        </div>

        {/* Gift Cards & Rewards */}
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{
            fontSize: '3rem',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            🎁
          </div>
          
          <h2 style={{
            color: 'var(--text-primary)',
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Gift Cards & Rewards
          </h2>
          
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0 0 1.5rem 0',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            Redeem your coins for valuable gift cards, mobile recharge, gaming credits and premium benefits.
          </p>

          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ color: '#a855f7', fontWeight: '600', marginBottom: '0.5rem' }}>
              🛒 Available Rewards:
            </div>
            <ul style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.2rem' }}>
              <li>Amazon & Flipkart gift cards</li>
              <li>Mobile recharge (instant)</li>
              <li>Gaming credits (PUBG, Free Fire)</li>
              <li>VIP membership & benefits</li>
            </ul>
          </div>

          <Link
            to="/redeem"
            style={{
              display: 'block',
              width: '100%',
              background: 'linear-gradient(135deg, #a855f7, #9333ea)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎯 Browse Rewards
          </Link>
        </div>

        {/* Bank Withdrawal */}
        <div style={{
          background: 'var(--glass-bg)',
          border: coins >= 15000 ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          opacity: coins >= 15000 ? 1 : 0.7,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (coins >= 15000) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{
            fontSize: '3rem',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            🏦
          </div>
          
          <h2 style={{
            color: 'var(--text-primary)',
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Bank Withdrawal
          </h2>
          
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0 0 1.5rem 0',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            Transfer your coins directly to your bank account. Quick and secure withdrawals.
          </p>

          {/* Compliance Warning */}
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              color: '#ffc107',
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Legal Notice
            </div>
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              lineHeight: 1.4
            }}>
              Bank withdrawals under legal review for compliance. Gift cards recommended as safer alternative.
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              💳 Withdrawal Details:
            </div>
            <ul style={{ color: 'var(--text-secondary)', margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
              <li>Minimum: ₹150 (15,000 coins)</li>
              <li>Rate: 1000 coins = ₹10</li>
              <li>Processing: 24-48 hours</li>
              {coins < 15000 && (
                <li style={{ color: '#ff6b6b' }}>
                  Need {(15000 - coins).toLocaleString()} more coins
                </li>
              )}
            </ul>
          </div>

          <button
            onClick={() => setShowBankWithdrawal(true)}
            disabled={coins < 15000}
            style={{
              width: '100%',
              background: coins >= 15000 ? 
                'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                'rgba(156, 163, 175, 0.3)',
              color: coins >= 15000 ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: coins >= 15000 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (coins >= 15000) {
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {coins >= 15000 ? '💸 Withdraw to Bank' : '❌ Insufficient Coins'}
          </button>
        </div>
      </div>

      {/* Bank Withdrawal Modal */}
      {showBankWithdrawal && (
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
            background: 'var(--glass-bg)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid var(--border-color)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: 'var(--text-primary)',
                margin: 0,
                fontSize: '1.5rem'
              }}>
                🏦 Bank Withdrawal
              </h3>
              <button
                onClick={() => setShowBankWithdrawal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Balance & Withdrawal Amount */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                color: 'var(--text-primary)',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Available Balance: {formatBalance(coins)}
              </div>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                Maximum Withdrawal: ₹{((coins || 0) / 100).toFixed(2)}
              </div>

              <label style={{
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Withdrawal Amount (₹):
              </label>
              <input
                type="number"
                min="150"
                max={((coins || 0) / 100)}
                step="10"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Minimum ₹150"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              {withdrawalAmount && (
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem'
                }}>
                  Coins required: {(withdrawalAmount * 100).toLocaleString()}
                </div>
              )}
            </div>

            {/* Bank Details Form */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{
                color: 'var(--text-primary)',
                margin: '0 0 1rem 0',
                fontSize: '1.1rem'
              }}>
                Bank Account Details
              </h4>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Account Holder Name:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Account Number:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    IFSC Code:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    Bank Name:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Compliance Warning */}
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                color: '#ffc107',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚠️ COMPLIANCE ALERT
              </div>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.4
              }}>
                <strong>Legal Warning:</strong> Bank withdrawals from gaming platforms may violate 
                Indian gaming regulations. We previously converted to virtual currency for compliance. 
                Consider gift cards/recharge as safer alternatives.
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowBankWithdrawal(false)}
                style={{
                  flex: 1,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleBankWithdrawal}
                style={{
                  flex: 1,
                  background: 'rgba(255, 193, 7, 0.2)',
                  border: '1px solid rgba(255, 193, 7, 0.5)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: '#ffc107',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ⚠️ Proceed (Risk)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawal; 