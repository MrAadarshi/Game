import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirebaseError, isFirebaseOnline } from './firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Register with email and password
  async register(email, password, name) {
    try {
      console.log('🔧 AuthService: Creating user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('🔧 AuthService: Firebase user created with UID:', user.uid);
      
      // Check network connectivity before creating Firestore document
      if (!isFirebaseOnline()) {
        console.warn('📱 Offline registration - user created but profile data will sync later');
        return user; // Allow registration but skip Firestore operations
      }
      
      try {
        // Create user document in Firestore with initial wallet balance
        const userData = {
          name,
          email,
          walletBalance: 1000, // Initial balance ₹1000
          createdAt: new Date(),
          lastLogin: new Date()
        };
        console.log('🔧 AuthService: Creating Firestore document with data:', userData);
        
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('🔧 AuthService: Firestore document created successfully');
      } catch (firestoreError) {
        const errorResult = handleFirebaseError(firestoreError);
        if (errorResult.offline) {
          console.warn('📱 Firestore offline - user profile will be created when online');
          // Continue with registration even if Firestore is offline
        } else {
          // Re-throw non-offline errors
          throw firestoreError;
        }
      }
      
      return user;
    } catch (error) {
      console.error('🔧 AuthService Error:', error);
      throw error;
    }
  },

  // Login with email and password (with ban checking)
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check network connectivity before making Firestore calls
      if (!isFirebaseOnline()) {
        console.warn('📱 Offline login - skipping ban check and user data sync');
        return user; // Allow login but skip Firestore operations
      }
      
      try {
        // Check if user is banned before allowing login
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if user is banned
          if (userData.banned) {
            // Check if ban has expired (for temporary bans)
            if (userData.banExpiresAt && userData.banExpiresAt.toDate() <= new Date()) {
              // Ban has expired, remove ban status
              await updateDoc(doc(db, 'users', user.uid), {
                banned: false,
                banReason: null,
                banExpiresAt: null,
                banDuration: null,
                lastLogin: new Date()
              });
              console.log('⏰ Temporary ban expired, user unbanned automatically');
            } else {
              // User is still banned, prevent login
              await signOut(auth); // Sign them out immediately
              
              let banMessage = `🚫 Your account has been banned.\n\nReason: ${userData.banReason || 'Violation of terms'}`;
              
              if (userData.banExpiresAt) {
                const expiryDate = userData.banExpiresAt.toDate().toLocaleDateString();
                banMessage += `\n\nYour ban will expire on: ${expiryDate}`;
              } else {
                banMessage += '\n\nThis is a permanent ban.';
              }
              
              banMessage += '\n\nIf you believe this is an error, please contact support.';
              
              throw new Error(banMessage);
            }
          } else {
            // User is not banned, update last login time
            await updateDoc(doc(db, 'users', user.uid), {
              lastLogin: new Date()
            });
          }
        }
      } catch (firestoreError) {
        const errorResult = handleFirebaseError(firestoreError);
        if (errorResult.offline) {
          console.warn('📱 Firestore offline - continuing with authentication only');
          // Continue with login even if Firestore is offline
        } else {
          // Re-throw non-offline errors
          throw firestoreError;
        }
      }
      
      return user;
    } catch (error) {
      // Handle authentication errors normally
      throw error;
    }
  },

  // Login with Google
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user document for new Google users
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          walletBalance: 1000, // Initial balance ₹1000
          createdAt: new Date(),
          lastLogin: new Date()
        });
      } else {
        // Check if existing user is banned
        const userData = userDoc.data();
        
        if (userData.banned) {
          // Check if ban has expired (for temporary bans)
          if (userData.banExpiresAt && userData.banExpiresAt.toDate() <= new Date()) {
            // Ban has expired, remove ban status
            await updateDoc(doc(db, 'users', user.uid), {
              banned: false,
              banReason: null,
              banExpiresAt: null,
              banDuration: null,
              lastLogin: new Date()
            });
            console.log('⏰ Temporary ban expired, user unbanned automatically');
          } else {
            // User is still banned, prevent login
            await signOut(auth); // Sign them out immediately
            
            let banMessage = `🚫 Your account has been banned.\n\nReason: ${userData.banReason || 'Violation of terms'}`;
            
            if (userData.banExpiresAt) {
              const expiryDate = userData.banExpiresAt.toDate().toLocaleDateString();
              banMessage += `\n\nYour ban will expire on: ${expiryDate}`;
            } else {
              banMessage += '\n\nThis is a permanent ban.';
            }
            
            banMessage += '\n\nIf you believe this is an error, please contact support.';
            
            throw new Error(banMessage);
          }
        } else {
          // User is not banned, update last login time
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date()
        });
        }
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}; 