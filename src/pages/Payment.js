import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/walletService';
import { notificationHelper } from '../utils/notificationHelper';
import { adminService } from '../services/adminService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';

const Payment = () => {
  const { user, walletBalance: authWalletBalance, addFunds, getTransactionHistory } = useAuth();
  const [walletBalance, setWalletBalance] = useState(authWalletBalance);
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);

  // Update local wallet balance when auth balance changes
  useEffect(() => {
    setWalletBalance(authWalletBalance);
  }, [authWalletBalance]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Deposit States
  const [depositAmount, setDepositAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Withdrawal States
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: ''
  });

  const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await getTransactionHistory();
      setTransactions(history || []);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatBalance = (balance) => {
    if (balance >= 10000000) {
      return `₹${(balance / 10000000).toFixed(1)}Cr`;
    } else if (balance >= 100000) {
      return `₹${(balance / 100000).toFixed(1)}L`;
    } else if (balance >= 1000) {
      return `₹${(balance / 1000).toFixed(1)}K`;
    }
    return `₹${balance?.toLocaleString() || '0'}`;
  };

  const handleDeposit = async () => {
    setError('');
    setSuccess('');

    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (depositAmount < 10) {
      setError('Minimum deposit amount is ₹10');
      return;
    }

    if (depositAmount > 100000) {
      setError('Maximum deposit amount is ₹1,00,000');
      return;
    }

    if (!transactionId.trim()) {
      setError('Please enter the transaction ID from your payment');
      return;
    }

    setLoading(true);
    try {
      // Create a deposit request that needs admin approval
      const depositRequest = {
        type: 'deposit_request', // Changed to match admin panel filter
        amount: parseFloat(depositAmount),
        transactionId: transactionId,
        status: 'pending',
        method: 'qr_code',
        userId: user?.uid || user?.email,
        userEmail: user?.email,
        userName: user?.displayName || user?.email?.split('@')[0] || 'User'
      };

      // Save deposit request to Firebase for admin approval
      console.log('💾 Saving deposit request to Firebase...');
      const savedRequest = await adminService.createPaymentRequest(depositRequest);
      console.log('✅ Deposit request saved:', savedRequest);

      setSuccess(`✅ Deposit request submitted successfully! Transaction ID: ${transactionId}. Your deposit will be processed within 2-4 hours and you'll receive a notification.`);
      
      // Send deposit pending notification to user
      notificationHelper.showDepositUpdate(
        parseFloat(depositAmount), 
        'pending', 
        transactionId
      );
      
      setDepositAmount('');
      setTransactionId('');
      
      // Refresh transaction history
      await loadTransactionHistory();
    } catch (error) {
      setError('Failed to submit deposit request. Please try again.');
      console.error('Deposit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setError('');
    setSuccess('');

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount < 50) {
      setError('Minimum withdrawal amount is ₹50');
      return;
    }

    if (withdrawAmount > walletBalance) {
      setError('Insufficient balance');
      return;
    }

    if (withdrawMethod === 'upi' && !upiId.trim()) {
      setError('Please enter your UPI ID');
      return;
    }

    if (withdrawMethod === 'bank') {
      const { accountNumber, ifscCode, accountHolderName, bankName } = bankDetails;
      if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
        setError('Please fill all bank details');
        return;
      }
    }

    setLoading(true);
    try {
      // First, deduct the amount from user's wallet immediately
      await walletService.updateWalletBalance(
        user?.uid || user?.email,
        -parseFloat(withdrawAmount),
        'withdrawal_pending',
        null,
        'Withdrawal Request'
      );

      // Create a withdrawal request that needs admin approval
      const withdrawRequest = {
        userId: user?.uid || user?.email,
        userEmail: user?.email,
        userName: user?.displayName || user?.email?.split('@')[0] || 'User',
        type: 'withdrawal_request',
        amount: parseFloat(withdrawAmount),
        status: 'pending',
        paymentMethod: withdrawMethod,
        paymentDetails: withdrawMethod === 'upi' ? { upiId } : bankDetails
      };

      // Store the withdrawal request in Firebase using adminService
      console.log('💾 Saving withdrawal request to Firebase...');
      const savedRequest = await adminService.createPaymentRequest(withdrawRequest);
      console.log('✅ Withdrawal request saved:', savedRequest);
      
      // Update local balance
      setWalletBalance(prev => prev - parseFloat(withdrawAmount));

      setSuccess(`Withdrawal request submitted successfully! ₹${withdrawAmount} has been deducted from your wallet and will be processed within 24-48 hours.`);
      
      // Send withdrawal pending notification
      notificationHelper.showWithdrawalUpdate(
        parseFloat(withdrawAmount), 
        'pending'
      );
      
      setWithdrawAmount('');
      setUpiId('');
      setBankDetails({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: ''
      });
      
      // Refresh transaction history
      await loadTransactionHistory();
    } catch (error) {
      setError('Failed to submit withdrawal request. Please try again.');
      console.error('Withdrawal error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fadeInUp">
      <Link to="/" className="back-btn">
        ← Back to Games
      </Link>

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Wallet Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-gold), var(--secondary-gold))',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          color: '#000',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600' }}>
            Your Wallet Balance
          </h2>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>
            {formatBalance(walletBalance)}
          </div>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
            Available for withdrawal and betting
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
          gap: '1rem',
        marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => setActiveTab('deposit')}
          style={{
            padding: '1rem 2rem',
              background: activeTab === 'deposit' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'deposit' ? '#000' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'deposit' ? '3px solid var(--primary-gold)' : '3px solid transparent',
              fontSize: '1rem',
              fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
            💳 Deposit Money
        </button>
        <button
            onClick={() => setActiveTab('withdraw')}
          style={{
            padding: '1rem 2rem',
              background: activeTab === 'withdraw' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'withdraw' ? '#000' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'withdraw' ? '3px solid var(--primary-gold)' : '3px solid transparent',
              fontSize: '1rem',
              fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
            💸 Withdraw Money
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '1rem 2rem',
              background: activeTab === 'history' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'history' ? '#000' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid var(--primary-gold)' : '3px solid transparent',
              fontSize: '1rem',
              fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          📊 Transaction History
        </button>
      </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            background: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: 'var(--accent-green)'
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255, 76, 76, 0.1)',
            border: '1px solid var(--accent-red)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: 'var(--accent-red)'
          }}>
            {error}
          </div>
        )}

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
          <div>
            <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
              💳 Deposit Money via QR Code
            </h3>
            
            {/* QR Code Section */}
            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
          padding: '2rem',
            marginBottom: '2rem', 
              textAlign: 'center'
            }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Scan QR Code to Pay
              </h4>
              
              {/* QR Code Placeholder */}
              <div style={{
                width: '200px',
                height: '200px',
                background: '#fff',
                borderRadius: '12px',
                margin: '0 auto 1rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                border: '2px solid var(--primary-gold)'
          }}>
                📱
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                Use any UPI app to scan this QR code and pay the amount
              </p>
          
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid var(--primary-gold)',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <strong style={{ color: 'var(--primary-gold)' }}>UPI ID:</strong> gaming@elite.upi
              </div>
            </div>

            {/* Amount Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}>
                Enter Amount (₹10 - ₹1,00,000)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount to deposit"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
                min="10"
                max="100000"
              />
              
              {/* Quick Amount Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount.toString())}
                    style={{ 
                      padding: '0.75rem',
                      background: depositAmount === amount.toString() ? 'var(--primary-gold)' : 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: depositAmount === amount.toString() ? '#000' : 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ₹{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction ID Input */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}>
                Transaction ID (from your payment app)
              </label>
                  <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID after payment"
                style={{
                  width: '100%',
                    padding: '1rem', 
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                After making payment, enter the transaction ID shown in your payment app
                    </small>
                  </div>

            {/* Deposit Instructions */}
                  <div style={{ 
              background: 'rgba(0, 173, 181, 0.1)',
              border: '1px solid var(--accent-color)',
                    borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem'
                  }}>
              <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
                📋 Deposit Instructions:
              </h4>
              <ol style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                <li>Select the amount you want to deposit</li>
                <li>Scan the QR code using any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Complete the payment</li>
                <li>Copy the transaction ID from your payment app</li>
                <li>Paste the transaction ID above and click Submit</li>
                <li>Your deposit will be added to your account within 2-4 hours</li>
                    </ol>
            </div>

            <button
              onClick={handleDeposit}
              disabled={loading || !depositAmount || !transactionId}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? 'var(--glass-bg)' : 'var(--accent-green)',
                color: loading ? 'var(--text-secondary)' : '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '⏳ Submitting...' : '💳 Submit Deposit Request'}
            </button>
        </div>
      )}

      {/* Withdrawal Tab */}
        {activeTab === 'withdraw' && (
          <div>
            <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
              💸 Withdraw Money
          </h3>
          
            {/* Withdrawal Amount */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}>
                Withdrawal Amount (₹50 - ₹{walletBalance?.toLocaleString()})
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
                min="50"
                max={walletBalance}
              />
            </div>

            {/* Withdrawal Method */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '1rem', 
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}>
                Withdrawal Method
              </label>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button
                  onClick={() => setWithdrawMethod('upi')}
                    style={{ 
                    flex: 1,
                    padding: '1rem',
                    background: withdrawMethod === 'upi' ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    color: withdrawMethod === 'upi' ? '#000' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                      fontSize: '1rem',
                    fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                  📱 UPI
                  </button>
                <button
                  onClick={() => setWithdrawMethod('bank')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: withdrawMethod === 'bank' ? 'var(--primary-gold)' : 'var(--glass-bg)',
                    color: withdrawMethod === 'bank' ? '#000' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🏦 Bank Transfer
                </button>
              </div>
            </div>

            {/* UPI Details */}
            {withdrawMethod === 'upi' && (
              <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                  display: 'block', 
                marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontWeight: '600'
              }}>
                  UPI ID
              </label>
                  <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="your-upi-id@paytm (or @gpay, @phonepe)"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                  />
              </div>
            )}

            {/* Bank Details */}
            {withdrawMethod === 'bank' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                <label style={{
                      display: 'block', 
                  marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                }}>
                      Account Holder Name
                </label>
                <input
                  type="text"
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                      placeholder="Full name as per bank"
                  style={{
                        width: '100%',
                    padding: '1rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      placeholder="Bank name"
                      style={{
                    width: '100%',
                        padding: '1rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
              </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      placeholder="Bank account number"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}>
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                      placeholder="Bank IFSC code"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Withdrawal Instructions */}
            <div style={{
              background: 'rgba(255, 76, 76, 0.1)',
              border: '1px solid var(--accent-red)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{ color: 'var(--accent-red)', marginBottom: '0.5rem' }}>
                📋 Withdrawal Instructions:
              </h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                <li>Minimum withdrawal amount is ₹50</li>
                <li>Withdrawal requests are processed within 24-48 hours</li>
                <li>Ensure your UPI ID or bank details are correct</li>
                <li>You will receive a confirmation once approved</li>
                <li>Processing fee: ₹5 (deducted from withdrawal amount)</li>
              </ul>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount || (withdrawMethod === 'upi' && !upiId) || 
                       (withdrawMethod === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifscCode || 
                        !bankDetails.accountHolderName || !bankDetails.bankName))}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? 'var(--glass-bg)' : 'var(--accent-red)',
                color: loading ? 'var(--text-secondary)' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '⏳ Submitting...' : '💸 Submit Withdrawal Request'}
            </button>
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === 'history' && (
          <div>
            <h3 style={{ color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
            📊 Transaction History
          </h3>
          
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                ⏳ Loading transaction history...
            </div>
          ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No transactions found
            </div>
          ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {transactions.map((transaction, index) => (
                <div 
                    key={index}
                  style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {transaction.type === 'deposit' ? '💳 Deposit' : 
                         transaction.type === 'withdrawal' ? '💸 Withdrawal' : 
                         transaction.type === 'bet' ? '🎰 Bet' : '🏆 Win'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {new Date(transaction.timestamp).toLocaleDateString()} at{' '}
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                      {transaction.game && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {transaction.game}
                        </div>
                      )}
                    </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: transaction.type === 'bet' ? 'var(--accent-red)' : 'var(--accent-green)'
                      }}>
                        {transaction.type === 'bet' ? '-' : '+'}₹{transaction.amount?.toLocaleString()}
                    </div>
                    {transaction.status && (
                      <div style={{ 
                          fontSize: '0.8rem',
                          color: transaction.status === 'pending' ? 'var(--primary-gold)' : 
                                 transaction.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-red)',
                          fontWeight: '600'
                      }}>
                          {transaction.status.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default Payment; 