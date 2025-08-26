# 🔥 Firebase Setup Guide for GMS Gaming

## ❌ Current Error: "auth/api-key-not-valid"
This error occurs because the Firebase configuration is not set up with your actual project credentials.

## 🚀 Step-by-Step Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Enter project name: `gms-gaming` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project dashboard, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password":
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
5. Enable "Google" (optional but recommended):
   - Click on "Google"
   - Toggle "Enable" to ON
   - Add your support email
   - Click "Save"

### Step 3: Create Firestore Database
1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users (e.g., "us-central1")
5. Click "Enable"

### Step 4: Get Your Firebase Configuration
1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app:
   - App nickname: `gms-gaming-web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
6. Copy the `firebaseConfig` object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Step 5: Update Your Code
1. Open `src/services/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project.firebaseapp.com", // Your actual auth domain
  projectId: "your-project-id", // Your actual project ID
  storageBucket: "your-project.appspot.com", // Your actual storage bucket
  messagingSenderId: "123456789", // Your actual sender ID
  appId: "1:123456789:web:abc123def456" // Your actual app ID
};
```

### Step 6: Set Firestore Security Rules
1. Go to Firestore Database > Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click "Publish"

### Step 7: Test Your Setup
1. Save all files
2. Run `npm start` in your terminal
3. Try to register a new user
4. Check the browser console for any Firebase errors

## 🔍 Troubleshooting

### Common Issues:
1. **"auth/api-key-not-valid"** → Firebase config not updated
2. **"auth/operation-not-allowed"** → Authentication method not enabled
3. **"permission-denied"** → Firestore rules not set correctly

### Check Your Setup:
- ✅ Firebase project created
- ✅ Authentication enabled (Email/Password)
- ✅ Firestore database created
- ✅ Config copied correctly
- ✅ Security rules published
- ✅ Code updated with real credentials

## 📱 Next Steps After Setup
1. Test user registration
2. Test user login
3. Test wallet functionality
4. Test games
5. Deploy to Firebase Hosting (optional)

## 🌐 Firebase Hosting (Optional)
If you want to deploy your app:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 🆘 Need Help?
- Check Firebase Console for error messages
- Review Firebase documentation
- Check browser console for detailed errors
- Ensure all credentials are copied exactly as shown

---

**⚠️ Important**: Never commit your actual Firebase credentials to version control. The current setup uses placeholder values for security. 