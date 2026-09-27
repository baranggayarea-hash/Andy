import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, loginAsGuestAdmin, logoutUser, testConnection } from '../lib/firebase';
import { seedInitialFirestoreData } from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseConnected: boolean;
  loginWithGoogle: () => Promise<User>;
  loginAsGuest: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  useEffect(() => {
    // Test Firestore connection on boot
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
      if (connected) {
        seedInitialFirestoreData();
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirebaseConnected,
        loginWithGoogle,
        loginAsGuest: loginAsGuestAdmin,
        logout: logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
