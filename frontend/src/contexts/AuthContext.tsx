import { createContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: ('owner' | 'provider')[];  // Changed to array to support multiple roles
  currentRole: 'owner' | 'provider';  // Currently active role
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: 'owner' | 'provider') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (role?: 'owner' | 'provider') => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: 'owner' | 'provider') => Promise<void>;
  addRole: (role: 'owner' | 'provider') => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  switchRole: async () => {},
  addRole: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      console.log('Fetching user data for:', firebaseUser.uid);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User document found:', userData);

        // Handle both old single role and new multiple roles format
        let roles: ('owner' | 'provider')[];
        if (Array.isArray(userData.roles)) {
          roles = userData.roles;
        } else if (userData.role) {
          // Migrate from old single role format
          roles = [userData.role];
        } else {
          roles = ['owner']; // Default fallback
        }

        const currentRole = userData.currentRole || roles[0];

        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData.displayName || firebaseUser.displayName || '',
          roles: roles,
          currentRole: currentRole,
          photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
        };
      }
      console.log('User document does not exist for:', firebaseUser.uid);
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: 'owner' | 'provider'
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore with initial role
      const userData = {
        email: firebaseUser.email,
        displayName,
        roles: [role],  // Start with one role, can add more later
        currentRole: role,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Initialize fields for both roles
        properties: [],
        skills: [],
        hourlyRate: 0,
        serviceRadius: 10,
        rating: 0,
        completedJobs: 0,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(error.message);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message);
    }
  };

  // Sign in with Google using popup
  const signInWithGoogle = async (role?: 'owner' | 'provider') => {
    try {
      console.log('[GOOGLE AUTH] Starting popup sign-in...');
      if (role) {
        console.log('[GOOGLE AUTH] Role specified:', role);
      }

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      console.log('[GOOGLE AUTH] Popup sign-in successful:', firebaseUser.email);

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        console.log('[GOOGLE AUTH] Creating new user document...');

        // Use provided role or default to 'owner'
        const userRole = role || 'owner';

        const userData = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          roles: [userRole],  // Start with one role, can add more later
          currentRole: userRole,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
          // Initialize fields for both roles
          properties: [],
          skills: [],
          hourlyRate: 0,
          serviceRadius: 10,
          rating: 0,
          completedJobs: 0,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        console.log('[GOOGLE AUTH] User document created with role:', userRole);

        // Manually fetch and set the user data to avoid race condition
        const newUserData = await fetchUserData(firebaseUser);
        if (newUserData) {
          console.log('[GOOGLE AUTH] Manually setting user data:', newUserData);
          setUser(newUserData);
          setLoading(false);
        }
      } else {
        console.log('[GOOGLE AUTH] User document already exists');
        // Fetch and set existing user data
        const existingUserData = await fetchUserData(firebaseUser);
        if (existingUserData) {
          console.log('[GOOGLE AUTH] Setting existing user data:', existingUserData);
          setUser(existingUserData);
          setLoading(false);
        }
      }
    } catch (error: any) {
      // Handle specific popup errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('[GOOGLE AUTH] Popup closed by user');
        throw new Error('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        console.error('[GOOGLE AUTH] Popup blocked by browser');
        throw new Error('Popup blocked. Please allow popups for this site.');
      } else {
        console.error('[GOOGLE AUTH] Error signing in with Google:', error);
        throw new Error(error.message);
      }
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message);
    }
  };

  // Switch between existing roles
  const switchRole = async (role: 'owner' | 'provider') => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (!user.roles.includes(role)) {
      throw new Error(`User does not have ${role} role. Please add it first.`);
    }

    try {
      console.log('[ROLE SWITCH] Switching to role:', role);

      // Update Firestore
      await setDoc(
        doc(db, 'users', user.id),
        { currentRole: role, updatedAt: new Date() },
        { merge: true }
      );

      // Update local state
      setUser({ ...user, currentRole: role });
      console.log('[ROLE SWITCH] Role switched successfully');
    } catch (error: any) {
      console.error('Error switching role:', error);
      throw new Error(error.message);
    }
  };

  // Add a new role to user's account
  const addRole = async (role: 'owner' | 'provider') => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (user.roles.includes(role)) {
      console.log('[ADD ROLE] User already has this role');
      return;
    }

    try {
      console.log('[ADD ROLE] Adding role:', role);

      const newRoles = [...user.roles, role];

      // Update Firestore
      await setDoc(
        doc(db, 'users', user.id),
        { roles: newRoles, updatedAt: new Date() },
        { merge: true }
      );

      // Update local state
      setUser({ ...user, roles: newRoles });
      console.log('[ADD ROLE] Role added successfully');
    } catch (error: any) {
      console.error('Error adding role:', error);
      throw new Error(error.message);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    console.log('[AUTH] Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AUTH STATE] Changed:', firebaseUser?.email || 'No user');

      if (firebaseUser) {
        // User is authenticated - fetch their data
        const userData = await fetchUserData(firebaseUser);

        if (userData) {
          console.log('[AUTH STATE] Setting user data:', userData);
          setUser(userData);
        } else {
          console.log('[AUTH STATE] No user document found - this should have been created during sign-in');
          setUser(null);
        }
      } else {
        // No user signed in
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      console.log('[AUTH] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    switchRole,
    addRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
