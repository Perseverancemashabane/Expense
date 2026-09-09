'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wallet,
  Building2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, loginAsDemo, register } = useAuth();

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regStudentNumber, setRegStudentNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regAllowance, setRegAllowance] = useState('3500');

  // Feedback states
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load remembered student ID
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tut_remembered_student_id');
      if (saved) {
        setIdentifier(saved);
      } else {
        setIdentifier('230099774');
      }
    } catch (e) {
      setIdentifier('230099774');
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (rememberMe) {
        localStorage.setItem('tut_remembered_student_id', identifier.trim());
      } else {
        localStorage.removeItem('tut_remembered_student_id');
      }

      const res = await login(identifier, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Authentication failed. Please verify student number or PIN.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemo();
    router.push('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await register({
        name: regName,
        studentNumber: regStudentNumber,
        email: regEmail,
        pinOrPassword: regPin,
        monthlyAllowance: parseFloat(regAllowance) || 3500,
      });

      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      {/* Background Subtle Highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* University & Department Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/90 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/20 mb-1">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            TUT Student Portal
          </h1>
          <p className="text-xs sm:text-sm font-medium text-emerald-400">
            Computer Systems Engineering • Work-Integrated Learning (PJD301B)
          </p>
          <p className="text-2xs text-slate-400">
            Student Budget & Expense Tracker • Allowance Manager
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="mt-7 bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/60 relative">
          {/* Quick Demo Sign-In Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900/90 border border-emerald-500/30">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  Academic Evaluator Quick Access
                </span>
                <p className="text-xs text-slate-300 font-medium">
                  Log in as Naledi Mashabane (230099774)
                </p>
              </div>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                <span>1-Click Demo</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                tab === 'signin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                tab === 'register'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Student
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="student-identifier"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Student Number or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="student-identifier"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="e.g. 230099774 or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="current-password"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Student PIN or Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="current-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter student portal PIN"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                  <span>Remember student number</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('230099774');
                    setPassword('1234');
                  }}
                  className="text-emerald-400 hover:underline text-xs"
                >
                  Auto-fill demo PIN
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-900/30 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Register New Student Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Full Student Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Sipho Ndlovu"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-student-number"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  TUT Student Number
                </label>
                <input
                  id="reg-student-number"
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="e.g. 231122334"
                  value={regStudentNumber}
                  onChange={(e) => setRegStudentNumber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  University Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@tut4life.ac.za"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-allowance"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Monthly Allowance / NSFAS (ZAR R)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs font-bold">
                    R
                  </span>
                  <input
                    id="reg-allowance"
                    type="number"
                    min="100"
                    step="50"
                    value={regAllowance}
                    onChange={(e) => setRegAllowance(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <span>Registering...</span> : <span>Create Student Account</span>}
              </button>
            </form>
          )}

          {/* Academic Footer Info */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-1">
            <p className="text-2xs text-slate-400">
              Department of Computer Systems Engineering • Pretoria / Soshanguve Campus
            </p>
            <p className="text-3xs text-slate-500">
              Student Author: Naledi Mashabane (230099774) • South African Rand (ZAR)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
