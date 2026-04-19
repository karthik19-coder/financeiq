import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, enableNetwork } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState('INITIALIZING'); // INITIALIZING | UNAUTHENTICATED | AUTHENTICATED
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authError, setAuthError] = useState(null);

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await updateProfile(newUser, { displayName: name });
    await setDoc(doc(db, 'users', newUser.uid), {
      uid: newUser.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp(),
      hasCompletedOnboarding: false
    });
    return newUser;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
        hasCompletedOnboarding: false
      });
    }
    return user;
  };

  // Safe one-time promise-based user check
  const checkUserDoc = async (currentUser) => {
    if (!currentUser) return;
    
    console.log('[Auth] Auth Detected for UID:', currentUser.uid);
    
    try {
      console.log(`[Auth] Fetching User Doc from Firestore`);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      let data = userDoc.data();
      
      if (!userDoc.exists()) {
        console.log('[Auth] User Doc NOT Found. Defensive Creation Triggered.');
        // Defensive user creation if we got auth but firestore dropped the write
        const payload = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'User',
          email: currentUser.email || '',
          createdAt: serverTimestamp(),
          hasCompletedOnboarding: false
        };
        await setDoc(doc(db, 'users', currentUser.uid), payload);
        data = payload;
        setIsNewUser(true);
      } else {
        console.log('[Auth] User Doc Found');
        if (data?.hasCompletedOnboarding !== true && data?.onboardingComplete !== true) {
          setIsNewUser(true);
        } else {
          setIsNewUser(false);
        }
      }
      
      setAuthState('AUTHENTICATED');
    } catch (error) {
      console.error('[Auth] Fetch Error:', error);
      // Wait shortly and retry once if minor connection glitch
      setTimeout(() => {
        setAuthState('INITIALIZING');
        window.location.reload();
      }, 5000);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setAuthState('UNAUTHENTICATED');
      } else {
        setUser(currentUser);
        checkUserDoc(currentUser);
      }
    });

    // Cleanup memory leaks
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    currentUser: user,
    authState,
    isNewUser,
    setIsNewUser,
    signup,
    login,
    logout,
    loginWithGoogle
  };

  if (authState === 'INITIALIZING') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent shadow-lg shadow-violet-500/20 mb-4"></div>
          <p className="text-slate-400 font-medium">Securing connection...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
