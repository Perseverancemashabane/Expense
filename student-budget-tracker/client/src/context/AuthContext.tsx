'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentUser } from '../types';

import { loginStudentAccount, registerStudentAccount } from '../lib/api';

interface AuthContextType {
  user: StudentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, pinOrPassword?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  register: (data: {
    name: string;
    studentNumber: string;
    email: string;
    pinOrPassword?: string;
    monthlyAllowance?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const DEMO_STUDENT: StudentUser = {
  id: 'tut-230099774',
  name: 'Naledi Perseverance Mashabane',
  studentNumber: '230099774',
  email: '230099774@tut4life.ac.za',
  institution: 'Tshwane University of Technology',
  department: 'Computer Systems Engineering',
  monthlyAllowance: 3500,
  avatarInitials: 'NM',
};

const STORAGE_KEY = 'tut_student_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.studentNumber) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, pinOrPassword = ''): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Try Live Database Authentication first
    try {
      const apiRes = await loginStudentAccount(identifier, pinOrPassword);
      if (apiRes.success && apiRes.user) {
        setUser(apiRes.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apiRes.user));
        return { success: true };
      }
      if (apiRes && apiRes.error) {
        return { success: false, error: apiRes.error };
      }
    } catch (apiErr) {
      console.warn('Live API sign-in attempted, falling back to client mode:', apiErr);
    }

    // 2. Check if identifier matches demo student
    if (
      cleanId === '230099774' ||
      cleanId === 'naledimashabane001@gmail.com' ||
      cleanId.includes('230099774') ||
      cleanId === 'admin'
    ) {
      if (pinOrPassword && pinOrPassword !== '1234') {
        return { success: false, error: 'Incorrect PIN. Demo student PIN is 1234.' };
      }
      setUser(DEMO_STUDENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_STUDENT));
      return { success: true };
    }

    // 3. Check custom registered students in localStorage
    try {
      const storedList = localStorage.getItem('tut_registered_students');
      const registered: any[] = storedList ? JSON.parse(storedList) : [];
      const found = registered.find(
        (s) => s.studentNumber.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
      );

      if (found) {
        if (found.password && pinOrPassword && pinOrPassword !== found.password) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
        setUser(found);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        return { success: true };
      }
    } catch (e) {
      console.warn('Error reading registered students:', e);
    }

    return {
      success: false,
      error: 'Account not found. Please click "Register New Student" to create your account and password.',
    };
  };

  const loginAsDemo = () => {
    setUser(DEMO_STUDENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_STUDENT));
  };

  const register = async (data: {
    name: string;
    studentNumber: string;
    email: string;
    pinOrPassword?: string;
    monthlyAllowance?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.name.trim()) return { success: false, error: 'Full name is required' };
    if (!data.studentNumber.trim()) return { success: false, error: 'Student number is required' };
    if (!data.pinOrPassword || data.pinOrPassword.trim().length < 4) {
      return { success: false, error: 'Please choose a password with at least 4 characters.' };
    }

    const initials = data.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';

    const localUser: any = {
      id: `tut-${data.studentNumber.trim()}`,
      name: data.name.trim(),
      studentNumber: data.studentNumber.trim(),
      email: data.email.trim() || `${data.studentNumber.trim()}@tut4life.ac.za`,
      institution: 'Tshwane University of Technology',
      department: 'Computer Systems Engineering',
      monthlyAllowance: data.monthlyAllowance || 3500,
      avatarInitials: initials,
      password: data.pinOrPassword.trim(),
    };

    // 1. Try Live Database Registration
    try {
      const apiRes = await registerStudentAccount({
        name: data.name,
        studentNumber: data.studentNumber,
        email: data.email,
        pin: data.pinOrPassword.trim(),
        monthlyAllowance: data.monthlyAllowance,
      });

      if (apiRes.success && apiRes.user) {
        setUser(apiRes.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apiRes.user));

        // Also update local list
        try {
          const storedList = localStorage.getItem('tut_registered_students');
          const registered: any[] = storedList ? JSON.parse(storedList) : [];
          registered.push({ ...apiRes.user, password: data.pinOrPassword.trim() });
          localStorage.setItem('tut_registered_students', JSON.stringify(registered));
        } catch {}

        return { success: true };
      }
      if (apiRes && apiRes.error) {
        return { success: false, error: apiRes.error };
      }
    } catch (apiErr) {
      console.warn('Live API registration attempted, falling back to client mode:', apiErr);
    }

    // 2. Client fallback
    try {
      const storedList = localStorage.getItem('tut_registered_students');
      const registered: any[] = storedList ? JSON.parse(storedList) : [];
      registered.push(localUser);
      localStorage.setItem('tut_registered_students', JSON.stringify(registered));
    } catch (e) {
      console.warn('Failed to save to registered students pool:', e);
    }

    setUser(localUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

