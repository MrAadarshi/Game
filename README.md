# 🎮 GMS Gaming - Real Money Gaming Platform

A comprehensive React-based real-money gaming website built with Firebase, featuring multiple betting games, user authentication, and wallet management.

## ✨ Features

### 🔐 Authentication System
- Email/Password registration and login
- Google OAuth integration
- Secure user session management
- Protected routes for authenticated users

### 💰 Wallet System
- Initial ₹1000 bonus on registration
- Real-time balance updates
- Transaction history tracking
- Secure bet placement and winnings processing

### 🎯 Gaming Experience
- **13 Exciting Games** including:
  - 🪙 Flip the Coin - Predict Heads or Tails
  - 💣 Mines - Avoid mines and win multipliers
  - 🎨 Color Prediction - Bet on Red, Green, or Violet
  - 🚀 Fly the Rocket - Cash out before crash
  - 🃏 Andar Bahar - Traditional card game
  - 🎡 Lucky Wheel - Spin for prizes
  - 🎲 Dice Roll - Multiple betting options
  - 📈 Crash Game - Graph-style multiplier
  - 🔢 Number Guessing - Win with multipliers
  - 🎰 Slot Machine - Classic slot experience
  - 🎯 Roulette - Numbers, colors, and ranges
  - 🃏 Card Match - Memory card game
  - 🏆 Jackpot - Pool-based winner selection

### 🎨 Modern UI/UX
- Dark theme with vibrant accents
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive game interfaces

## 🚀 Tech Stack

- **Frontend**: React 18, React Router, CSS3
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **State Management**: React Context API
- **Styling**: Custom CSS with modern design principles

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Modern web browser

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gaming-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password + Google)
4. Create Firestore database
5. Set up Firebase Hosting

#### Update Firebase Config
1. Get your Firebase configuration from Project Settings
2. Update `src/services/firebase.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

#### Firestore Security Rules
Set up Firestore security rules for your collections:

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

### 4. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
```

## 🌐 Deployment

### Firebase Hosting
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init hosting
```

4. Deploy to Firebase:
```bash
firebase deploy
```

## 🎮 Game Rules & Mechanics

### Flip the Coin
- Bet on Heads or Tails
- Win 2x your bet amount
- 50/50 chance of winning

### Mines
- Choose number of mines (1-24)
- Click tiles to reveal gems
- Cash out anytime or risk hitting a mine
- Multiplier increases with each safe tile

### Color Prediction
- Red: 2x multiplier (40% probability)
- Green: 14x multiplier (10% probability)
- Violet: 4.5x multiplier (50% probability)

### Fly the Rocket
- Multiplier increases continuously
- Cash out before the rocket crashes
- Random crash point between 1x-11x
- Real-time multiplier display

## 🔒 Security Features

- Protected routes for authenticated users
- Secure Firebase Authentication
- Firestore security rules
- Input validation and sanitization
- Secure wallet transactions

## 📱 Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly controls
- Responsive grid layouts

## 🎨 Design System

### Color Palette
- **Background**: #121212 (Dark Gray/Black)
- **Primary Accent**: #FFB400 (Gold/Yellow)
- **Secondary Accent**: #00C9A7 (Turquoise)
- **Danger/Alert**: #FF4C4C (Red)
- **Text**: #FFFFFF (White) and #CCCCCC (Light Gray)

### Typography
- Modern, readable fonts
- Consistent hierarchy
- Accessible contrast ratios

## 🚧 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.js      # Navigation bar
├── context/            # React Context providers
│   └── AuthContext.js # Authentication & wallet state
├── pages/              # Page components
│   ├── Home.js        # Home page with game grid
│   ├── Login.js       # Login page
│   ├── Register.js    # Registration page
│   └── games/         # Individual game components
├── services/           # Firebase services
│   ├── firebase.js    # Firebase configuration
│   ├── authService.js # Authentication service
│   └── walletService.js # Wallet management
├── App.js             # Main app component
└── index.js           # App entry point
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### Customization
- Modify game rules in individual game components
- Adjust betting limits in `walletService.js`
- Customize UI colors in `App.css`
- Add new games by creating components and updating routes

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📈 Performance

- Lazy loading for game components
- Optimized Firebase queries
- Efficient state management
- Minimal bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check Firebase documentation
- Review React and Firebase best practices

## 🔮 Future Enhancements

- Real-time multiplayer games
- Advanced analytics dashboard
- Mobile app development
- Additional payment methods
- Enhanced security features
- Performance optimizations

---

**⚠️ Disclaimer**: This is a demonstration project. Real-money gaming requires proper licensing, compliance, and security measures. Ensure compliance with local gambling laws and regulations before deploying for production use. 