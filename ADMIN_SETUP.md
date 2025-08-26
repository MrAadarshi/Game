# 👑 Admin Setup Guide for GMS Gaming

## 🎯 **How to Access Admin Panel**

### **Method 1: Direct URL Access**
- Navigate to: `http://localhost:3000/admin`
- You must be logged in and have admin privileges

### **Method 2: Navbar Admin Link**
- After logging in, if you have admin access, you'll see a **👑 Admin** button in the navbar
- Click it to access the admin dashboard

## 🔐 **Setting Up Admin Access**

### **Step 1: Make Yourself an Admin**

#### **Option A: Update Firebase Config (Recommended)**
1. Open `src/services/adminService.js`
2. Find the `ADMIN_UIDS` array
3. Add your user UID:

```javascript
const ADMIN_UIDS = [
  "your-actual-user-uid-here", // Replace with your Firebase user UID
  // Add more admin UIDs as needed
];
```

#### **Option B: Update User Role in Firestore**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `crypto-mining-d42ae`
3. Go to **Firestore Database**
4. Find your user document in the `users` collection
5. Add a field: `role: "admin"` or `isAdmin: true`

### **Step 2: Get Your User UID**
1. Log into the gaming platform
2. Open browser console (F12)
3. Type: `console.log(auth.currentUser.uid)`
4. Copy the UID that appears

### **Step 3: Restart the App**
- Stop the development server (Ctrl+C)
- Run `npm start` again
- Log in with your admin account

## 🎮 **Admin Features Available**

### **📊 Dashboard Tab**
- **Total Users**: Count of all registered users
- **Total Transactions**: All betting and gaming transactions
- **Total Wallet Balance**: Sum of all user wallet balances
- **Recent Activity**: Transactions and signups in last 24 hours

### **👥 Users Tab**
- **User List**: View all registered users
- **Role Management**: Change user roles (User/Admin/Moderator)
- **User Details**: See user information and wallet balances
- **User Actions**: Manage individual users

### **💰 Transactions Tab**
- **Transaction History**: View all platform transactions
- **Transaction Types**: Bet, Win, Loss, Admin adjustments
- **Game Tracking**: See which games users played
- **Time Stamps**: When transactions occurred

### **🎯 Wallet Management Tab**
- **Wallet Adjustments**: Add/remove money from user wallets
- **Reason Tracking**: Document why adjustments were made
- **Balance Updates**: Real-time wallet balance modifications
- **Admin Audit Trail**: Track all admin actions

## 🔧 **Admin Operations**

### **Managing User Roles**
1. Go to **Users** tab
2. Find the user you want to modify
3. Use the dropdown to select new role:
   - **User**: Regular gaming user
   - **Admin**: Full admin access
   - **Moderator**: Limited admin access

### **Adjusting User Wallets**
1. Go to **Users** tab
2. Click **Manage** button for the user
3. Go to **Wallet Management** tab
4. Enter adjustment amount:
   - **Positive**: Add money (bonus, support)
   - **Negative**: Remove money (penalty, correction)
5. Enter reason for adjustment
6. Click **Update Wallet**

### **Monitoring Platform Activity**
1. **Dashboard**: Overview of platform health
2. **Users**: Track user growth and activity
3. **Transactions**: Monitor gaming activity and patterns
4. **Real-time Updates**: Data refreshes automatically

## 🛡️ **Security Features**

### **Admin Verification**
- Double-checks admin status on every page load
- Prevents unauthorized access to admin functions
- Logs all admin actions for audit purposes

### **Access Control**
- Only users with admin privileges can access admin panel
- Role-based permissions for different admin levels
- Secure wallet adjustments with reason tracking

### **Data Protection**
- Users can only see their own data
- Admins can view all data for management purposes
- Secure Firestore rules protect sensitive information

## 📱 **Admin Panel Navigation**

### **Tab System**
- **Dashboard**: System overview and statistics
- **Users**: User management and role assignment
- **Transactions**: Transaction monitoring and history
- **Wallet Management**: User wallet adjustments

### **Responsive Design**
- Works on desktop and mobile devices
- Optimized for all screen sizes
- Touch-friendly controls for mobile admin use

## 🚨 **Important Admin Notes**

### **Wallet Adjustments**
- Always provide clear reasons for adjustments
- Be careful with negative amounts (can't go below ₹0)
- Monitor for unusual patterns or abuse

### **User Management**
- Don't make too many users admin
- Use moderator role for limited access
- Monitor user behavior and activity

### **System Monitoring**
- Check dashboard regularly for platform health
- Monitor transaction patterns for fraud detection
- Track user growth and engagement metrics

## 🔍 **Troubleshooting**

### **Admin Access Not Working**
1. Check if your UID is in `ADMIN_UIDS` array
2. Verify user document has `role: "admin"` in Firestore
3. Restart the development server
4. Clear browser cache and cookies

### **Admin Panel Not Loading**
1. Check browser console for errors
2. Verify Firebase connection is working
3. Ensure you're logged in with the correct account
4. Check Firestore security rules

### **Data Not Updating**
1. Refresh the admin panel
2. Check Firestore for data changes
3. Verify admin service functions are working
4. Check browser console for error messages

## 🎯 **Best Practices**

### **Daily Admin Tasks**
- Check dashboard for platform health
- Monitor recent user signups
- Review transaction patterns
- Check for any unusual activity

### **Weekly Admin Tasks**
- Review user growth trends
- Analyze gaming patterns
- Check wallet balance distributions
- Review admin action logs

### **Monthly Admin Tasks**
- Generate platform reports
- Analyze user retention
- Review security settings
- Plan platform improvements

## 🆘 **Need Help?**

### **Common Issues**
- **Access Denied**: Check admin privileges and UID
- **Data Not Loading**: Verify Firestore connection
- **Wallet Update Failed**: Check user exists and amount validity

### **Support Resources**
- Check browser console for error messages
- Review Firebase Console for data issues
- Verify Firestore security rules
- Check admin service configuration

---

**⚠️ Important**: Admin access gives you full control over the platform. Use it responsibly and always document your actions with clear reasons. 