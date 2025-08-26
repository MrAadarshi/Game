# 🚀 Admin Panel Testing Guide

## How to Access Admin Panel

### Method 1: Use Demo Admin Account
1. **Login/Register** with any email containing "admin" (e.g., `admin@test.com`)
2. **Navigate** to `/admin` or click on the Admin link
3. **You should see** the full admin dashboard

### Method 2: Create Admin User in Firebase
1. Go to your Firebase Console
2. Navigate to Authentication → Users
3. Find your user and add custom claims: `{ "admin": true }`

## 🎯 Admin Features to Test

### 1. **User Management** (Users Tab)
- ✅ **Search Users**: Type any email/username to find users
- ✅ **View User Details**: Click on any user to see:
  - 💰 Financial Summary (deposits, withdrawals, profit/loss)
  - 🎮 Game Statistics (per-game performance)
  - 📊 Transaction History
- ✅ **Balance Control**: Click "Adjust Balance" to add/remove money
- ✅ **Ban Users**: Click "Ban User" for duration/reason options

### 2. **Game Management** (Games Tab)
- ✅ **View All 13 Games**: Should show all games with statistics
- ✅ **Enable/Disable Games**: Toggle individual games on/off
- ✅ **Set Betting Limits**: Click any game to modify min/max bets
- ✅ **View Game Statistics**: See revenue, player count, average bets

### 3. **Payment Management** (Requests Tab)
- ✅ **Approve Deposits**: Auto-adds money to user wallet + notification
- ✅ **Process Withdrawals**: Auto-deducts money + approval notification
- ✅ **Reject Requests**: Auto-refunds money for rejected withdrawals

### 4. **Dashboard Analytics**
- ✅ **Real-time Statistics**: User counts, revenue, active players
- ✅ **Recent Activity**: Live transaction feed
- ✅ **System Health**: Platform status indicators

## 🔧 Troubleshooting

### If Admin Panel Shows "Access Denied":
```bash
# Check browser console for errors
# Try logging in with admin@test.com
# Clear browser cache and reload
```

### If Features Don't Load:
```bash
# Open browser DevTools (F12)
# Check Console tab for JavaScript errors
# Check Network tab for failed API calls
```

### If Games Don't Show:
```bash
# Check console for "Loading all games..." message
# Verify Firebase connection in Network tab
# Try refreshing the page
```

## 🎮 Testing Workflow

1. **Login as Admin**: Use email with "admin" in it
2. **Navigate to Users Tab**: Search for a user
3. **Test Balance Adjustment**: Add/remove money from user
4. **Go to Games Tab**: Enable/disable a game
5. **Check Requests Tab**: Process any pending payments
6. **Verify Dashboard**: Check if stats update

## 📱 Expected UI Changes

You should see:
- 🎯 **4 Main Tabs**: Dashboard, Requests, Users, Games
- 👥 **User Search Interface**: Search bar + user cards
- 🎮 **Game Cards**: All 13 games with enable/disable buttons
- 💰 **Balance Adjustment Modal**: Professional dialog for money changes
- 🚫 **Ban User Modal**: Duration selector + reason input
- 📊 **Comprehensive Statistics**: Financial summaries + game analytics

## 🐛 Common Issues

1. **"Cannot read properties of undefined"**: Check Firebase configuration
2. **Admin access denied**: Ensure email contains "admin"
3. **Features not loading**: Check browser console for errors
4. **UI looks the same**: Hard refresh (Ctrl+F5) or clear cache

## 📞 Need Help?

If you still don't see the enhanced features:
1. Share any error messages from browser console
2. Confirm which email you're using to login
3. Let me know which specific features are missing 