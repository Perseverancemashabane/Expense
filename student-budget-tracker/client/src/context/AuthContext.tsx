'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentUser } from '../types';

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
    
    // Check if identifier matches demo student
    if (
      cleanId === '230099774' ||
      cleanId === 'naledimashabane001@gmail.com' ||
      cleanId.includes('230099774') ||
      cleanId === 'admin'
    ) {
      setUser(DEMO_STUDENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_STUDENT));
      return { success: true };
    }

    // Check custom registered students in localStorage
    try {
      const storedList = localStorage.getItem('tut_registered_students');
      const registered: StudentUser[] = storedList ? JSON.parse(storedList) : [];
      const found = registered.find(
        (s) => s.studentNumber.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
      );

      if (found) {
        setUser(found);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        return { success: true };
      }
    } catch (e) {
      console.warn('Error reading registered students:', e);
    }

    // For academic evaluation: If a student number (numbers only) or valid email is provided, allow access with dynamic profile
    if (/^\d{7,10}$/.test(cleanId) || cleanId.includes('@')) {
      const isEmail = cleanId.includes('@');
      const studentNum = isEmail ? cleanId.split('@')[0] : cleanId;
      const dynamicUser: StudentUser = {
        id: `tut-${studentNum}`,
        name: `Student ${studentNum}`,
        studentNumber: studentNum,
        email: isEmail ? cleanId : `${studentNum}@tut4life.ac.za`,
        institution: 'Tshwane University of Technology',
        department: 'Computer Systems Engineering',
        monthlyAllowance: 3500,
        avatarInitials: studentNum.slice(0, 2).toUpperCase(),
      };
      setUser(dynamicUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicUser));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid student number or email. (Hint: Use 230099774 or click 1-Click Demo Sign-In)',
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

    const initials = data.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';

    const newUser: StudentUser = {
      id: `tut-${data.studentNumber.trim()}`,
      name: data.name.trim(),
      studentNumber: data.studentNumber.trim(),
      email: data.email.trim() || `${data.studentNumber.trim()}@tut4life.ac.za`,
      institution: 'Tshwane University of Technology',
      department: 'Computer Systems Engineering',
      monthlyAllowance: data.monthlyAllowance || 3500,
      avatarInitials: initials,
    };

    try {
      const storedList = localStorage.getItem('tut_registered_students');
      const registered: StudentUser[] = storedList ? JSON.parse(storedList) : [];
      registered.push(newUser);
      localStorage.setItem('tut_registered_students', JSON.stringify(registered));
    } catch (e) {
      console.warn('Failed to save to registered students pool:', e);
    }

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
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

