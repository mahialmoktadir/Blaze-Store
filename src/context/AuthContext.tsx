'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '@/src/lib/firebase.ts';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  phone?: string;
  whatsapp?: string;
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isAdmin: false,
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithBackend = async (firebaseUser: User) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          phone: firebaseUser.phoneNumber || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAppUser(data.user);
      }
    } catch (err) {
      console.error('Error syncing user with database:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        await syncUserWithBackend(currentUser);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        await syncUserWithBackend(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      // If popup was closed by user or blocked, fallback gracefully
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setAppUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await syncUserWithBackend(user);
    }
  };

  // Determine admin rights: role is admin OR email is creator's email
  const isAdmin: boolean = Boolean(
    appUser?.role === 'admin' ||
    user?.email?.toLowerCase() === 'mrmahirajkumar143@gmail.com' ||
    user?.email?.toLowerCase().includes('mahialmoktadir')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        loading,
        signInWithGoogle,
        signOut,
        isAdmin,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
