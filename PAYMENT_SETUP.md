# 💰 Payment System Setup Guide

## 🎯 Overview

This gaming website now includes a comprehensive payment system that allows users to:
- **Request deposits** (UPI or Bank Transfer)
- **Request withdrawals** (UPI or Bank Transfer)
- **View transaction history** with detailed status tracking
- **Track payment request statuses** (Pending, Approved, Rejected)

Admins can:
- **Review and process** all payment requests
- **Approve/reject** deposits and withdrawals
- **Manage user wallets** directly
- **View complete transaction history**

## 🚀 Features

### For Users:
1. **Deposit Requests**
   - Minimum: ₹100, Maximum: ₹100,000
   - Payment methods: UPI or Bank Transfer
   - Real-time status tracking

2. **Withdrawal Requests**
   - Minimum: ₹100, Maximum: Available balance
   - Same payment methods as deposits
   - Instant balance validation

3. **Transaction History**
   - Complete record of all transactions
   - Game results, deposits, withdrawals
   - Status tracking for payment requests

### For Admins:
1. **Payment Request Management**
   - View all pending requests
   - Approve/reject with one click
   - Add admin notes
   - Track processing history

2. **Wallet Management**
   - Adjust user balances
   - View transaction logs
   - Monitor system activity

## 🔧 Setup Instructions

### 1. Firebase Configuration

Ensure your Firebase project has the following collections:
- `users` - User profiles and wallet balances
- `transactions` - All financial transactions
- `payment_requests` - Deposit/withdrawal requests

### 2. Firestore Security Rules

Deploy the `firestore.rules` file to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

### 3. Admin Setup

To make a user an admin, add their UID to the `ADMIN_UIDS` array in `src/services/adminService.js`:

```javascript
const ADMIN_UIDS = [
  "your-admin-user-uid-here",
  "another-admin-uid"
];
```

Alternatively, set the user's role to 'admin' in the Firestore users collection.

### 4. Payment Method Configuration

The system supports two payment methods:

#### UPI Payments:
- Users enter their UPI ID (e.g., `user@upi`)
- Admins can process these instantly

#### Bank Transfers:
- Users provide bank details:
  - Account Holder Name
  - Bank Name
  - Account Number
  - IFSC Code
- Admins can process these manually

## 📱 User Interface

### Payment Page (`/payment`)
- **Deposit Tab**: Submit deposit requests
- **Withdrawal Tab**: Submit withdrawal requests
- **History Tab**: View all transactions

### Admin Panel (`/admin`)
- **Dashboard**: System overview and stats
- **Users**: Manage user accounts
- **Transactions**: View all financial activity
- **Payment Requests**: Process deposits/withdrawals
- **Wallet Management**: Adjust user balances

## 🔄 Workflow

### Deposit Process:
1. User submits deposit request with payment details
2. Request appears in admin panel as "Pending"
3. Admin reviews and approves/rejects
4. If approved, user's wallet is credited
5. Transaction is recorded with status

### Withdrawal Process:
1. User submits withdrawal request
2. System validates sufficient balance
3. Request appears in admin panel
4. Admin processes the withdrawal
5. If approved, user's wallet is debited
6. Transaction is recorded with status

## 🛡️ Security Features

1. **User Authentication**: All operations require valid login
2. **Data Isolation**: Users can only access their own data
3. **Admin Verification**: Admin functions require proper authorization
4. **Transaction Logging**: All actions are recorded for audit
5. **Balance Validation**: Prevents negative balances

## 📊 Transaction Types

The system tracks these transaction types:
- `bet` - Game betting
- `win` - Game winnings
- `loss` - Game losses
- `deposit_request` - Deposit request submitted
- `withdrawal_request` - Withdrawal request submitted
- `deposit_approved` - Deposit processed
- `withdrawal_approved` - Withdrawal processed
- `deposit_rejected` - Deposit rejected
- `withdrawal_rejected` - Withdrawal rejected
- `admin` - Admin wallet adjustments

## 🎨 Customization

### Colors and Styling:
- **Primary**: #00C9A7 (Teal)
- **Secondary**: #FFB400 (Gold)
- **Danger**: #FF4C4C (Red)
- **Success**: #00C9A7 (Green)
- **Warning**: #FFB400 (Orange)

### Payment Limits:
Modify the limits in `src/pages/Payment.js`:
```javascript
const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];
// Minimum: 100, Maximum: 100000
```

## 🚨 Troubleshooting

### Common Issues:

1. **Payment requests not showing in admin panel**
   - Check Firestore rules
   - Verify admin status
   - Check browser console for errors

2. **Transactions not recording**
   - Verify Firebase configuration
   - Check Firestore permissions
   - Review transaction logging

3. **Admin functions not working**
   - Verify admin UID in adminService
   - Check user role in Firestore
   - Ensure proper authentication

### Debug Tools:
- Browser console logging
- Firestore console monitoring
- Transaction history tracking
- Admin panel status indicators

## 📈 Future Enhancements

Potential improvements:
1. **Automated Payment Processing**
2. **Payment Gateway Integration**
3. **KYC Verification System**
4. **Multi-currency Support**
5. **Advanced Analytics Dashboard**
6. **Email Notifications**
7. **SMS Alerts**
8. **Payment Method Validation**

## 🔗 Navigation

Users can access the payment system via:
- **Navbar**: "💳 Payment" button
- **Home Page**: "💳 Manage Payments" button
- **Direct URL**: `/payment`

Admins can access the admin panel via:
- **Navbar**: "👑 Admin" button (admin users only)
- **Direct URL**: `/admin`

## 📞 Support

For technical support or questions:
1. Check the browser console for error messages
2. Verify Firebase configuration
3. Review Firestore security rules
4. Check user permissions and admin status

---

**Note**: This payment system is designed for demonstration purposes. For production use, implement additional security measures, payment gateway integrations, and compliance with local financial regulations. 