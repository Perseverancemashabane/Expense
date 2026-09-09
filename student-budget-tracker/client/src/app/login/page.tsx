'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Phone,
  ExternalLink,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginAsDemo,
    register,
    requestPasswordReset,
    confirmPasswordReset,
  } = useAuth();

  const [tab, setTab] = useState<'signin' | 'register' | 'forgot' | 'reset'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regStudentNumber, setRegStudentNumber] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAllowance, setRegAllowance] = useState('3500');

  // Forgot Password state
  const [forgotId, setForgotId] = useState('');
  const [forgotResult, setForgotResult] = useState<{
    message?: string;
    token?: string;
    resetLink?: string;
    whatsappLink?: string;
    phoneNumber?: string;
    maskedContact?: string;
    studentNumber?: string;
  } | null>(null);

  // Reset Password state
  const [resetStudentNumber, setResetStudentNumber] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
        setForgotId(saved);
      } else {
        setIdentifier('230099774');
        setForgotId('230099774');
      }
    } catch (e) {
      setIdentifier('230099774');
      setForgotId('230099774');
    }
  }, []);

  // Handle URL query parameters for reset links (?mode=reset&token=...&student=...)
  useEffect(() => {
    const mode = searchParams.get('mode');
    const token = searchParams.get('token');
    const student = searchParams.get('student');

    if (mode === 'reset' || token) {
      setTab('reset');
      if (token) setResetToken(token);
      if (student) setResetStudentNumber(student);
    } else if (mode === 'forgot') {
      setTab('forgot');
    } else if (mode === 'register') {
      setTab('register');
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
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
    setSuccessMsg('');

    if (!regName.trim()) {
      setError('Please enter your full student name.');
      return;
    }
    if (!regStudentNumber.trim()) {
      setError('Please enter your TUT student number.');
      return;
    }
    if (!regPin || regPin.trim().length < 4) {
      setError('Please create a password of at least 4 characters.');
      return;
    }
    if (regPin.trim() !== regConfirmPin.trim()) {
      setError('Passwords do not match. Please re-enter your password to confirm.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({
        name: regName.trim(),
        studentNumber: regStudentNumber.trim(),
        email: regEmail.trim(),
        phoneNumber: regPhone.trim(),
        pinOrPassword: regPin.trim(),
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setForgotResult(null);

    if (!forgotId.trim()) {
      setError('Please provide your WhatsApp number or TUT student number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestPasswordReset(forgotId.trim(), 'whatsapp');
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset link prepared for WhatsApp!');
        setForgotResult({
          message: res.message,
          token: res.token,
          resetLink: res.resetLink,
          whatsappLink: res.whatsappLink,
          phoneNumber: res.phoneNumber,
          maskedContact: res.maskedContact,
          studentNumber: res.studentNumber,
        });
        if (res.studentNumber) {
          setResetStudentNumber(res.studentNumber);
        }
        if (res.token) {
          setResetToken(res.token);
        }
        if (res.whatsappLink) {
          try {
            window.open(res.whatsappLink, '_blank');
          } catch {}
        }
      } else {
        setError(res.error || 'Could not find account. Please verify details.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch WhatsApp reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetStudentNumber.trim()) {
      setError('Please enter your TUT student number.');
      return;
    }
    if (!resetToken.trim()) {
      setError('Please enter the 6-digit reset code received on WhatsApp.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.trim().length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (resetNewPassword.trim() !== resetConfirmPassword.trim()) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await confirmPasswordReset(
        resetStudentNumber.trim(),
        resetToken.trim(),
        resetNewPassword.trim()
      );

      if (res.success) {
        setSuccessMsg(res.message || 'Your password has been successfully reset! You may now sign in.');
        setIdentifier(resetStudentNumber.trim());
        setPassword(resetNewPassword.trim());
        setTab('signin');
      } else {
        setError(res.error || 'Password reset failed. Token may be invalid or expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during password reset.');
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
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition cursor-pointer ${
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
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition cursor-pointer ${
                tab === 'register'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Student
            </button>
            {(tab === 'forgot' || tab === 'reset') && (
              <button
                type="button"
                className="flex-1 py-2 text-center rounded-lg bg-emerald-600 text-white shadow-xs"
              >
                {tab === 'forgot' ? 'Forgot Password' : 'Reset Password'}
              </button>
            )}
          </div>

          {/* Success Alert */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="space-y-1">
                <span className="font-semibold">{successMsg}</span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1.5">
                <span>{error}</span>
                {/* Helpful navigation when account conflict occurs */}
                {error.toLowerCase().includes('already exists') && (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signin');
                        setError('');
                      }}
                      className="text-emerald-400 hover:underline font-semibold text-2xs cursor-pointer"
                    >
                      → Go to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        setError('');
                      }}
                      className="text-amber-400 hover:underline font-semibold text-2xs cursor-pointer"
                    >
                      → Reset Password
                    </button>
                  </div>
                )}
              </div>
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
                  Student Number or WhatsApp Number
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
                    placeholder="e.g. 230099774 or 082 123 4567"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="current-password"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    Student Password or PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setError('');
                      setSuccessMsg('');
                      if (identifier) setForgotId(identifier);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    Forgot Password / PIN?
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="reg-phone"
                    className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Number</span>
                  </label>
                  <span className="text-3xs text-emerald-400 font-medium">For Password Reset Links</span>
                </div>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="e.g. 082 123 4567 or +27 82 123 4567"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <p className="text-3xs text-slate-400 mt-1">
                  Your password reset links will be sent directly to this WhatsApp number.
                </p>
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

              <div>
                <label
                  htmlFor="reg-pin"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Create Student Password or PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-pin"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Create your portal password (min 4 chars)"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <button
                    type="button"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-pin"
                  className="block text-xs font-semibold text-slate-300 mb-1"
                >
                  Confirm Password or PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-confirm-pin"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Re-enter password to confirm"
                    value={regConfirmPin}
                    onChange={(e) => setRegConfirmPin(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
                <p className="text-3xs text-slate-400 mt-1">
                  You will use this password each time you sign into your private student expense account.
                </p>
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

          {/* Tab 3: Forgotten Password / Request Reset Link Form (WhatsApp) */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Reset Password via WhatsApp
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered WhatsApp Number or Student Number. We will generate your secure reset link and send it directly to your WhatsApp.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-id"
                    className="block text-xs font-semibold text-slate-300 mb-1"
                  >
                    WhatsApp Number or Student Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="forgot-id"
                      type="text"
                      required
                      placeholder="e.g. 082 123 4567 or 230099774"
                      value={forgotId}
                      onChange={(e) => setForgotId(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Your reset link will be sent to your registered WhatsApp number for instant 1-tap recovery.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Preparing WhatsApp Link...</span>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Reset Link to WhatsApp</span>
                    </>
                  )}
                </button>
              </form>

              {/* If Reset Code was Generated and Dispatched via WhatsApp */}
              {forgotResult && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Reset Link Ready</span>
                  </div>
                  <p className="text-2xs text-slate-300 leading-relaxed">
                    Reset link generated for WhatsApp number{' '}
                    <strong className="text-white">{forgotResult.maskedContact}</strong>.
                  </p>

                  {forgotResult.whatsappLink && (
                    <a
                      href={forgotResult.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Open WhatsApp to Receive Link</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  )}

                  {forgotResult.token && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-700">
                        <div>
                          <span className="text-3xs uppercase tracking-wider text-slate-400 font-bold block">
                            6-Digit Reset Code
                          </span>
                          <span className="text-lg font-mono font-black text-emerald-400 tracking-widest">
                            {forgotResult.token}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTab('reset');
                            setError('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                        >
                          <span>Enter Code Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-3xs text-slate-400 leading-normal">
                        💡 <em>Tip: You can click &quot;Open WhatsApp to Receive Link&quot; above to open the message, or click &quot;Enter Code Now&quot; to set your new password directly on this screen.</em>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('reset');
                    setError('');
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Already have a reset code?
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Reset Password Execution Form */}
          {tab === 'reset' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Enter Reset Code & Set New Password
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your student number, the 6-digit verification code, and your new password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="reset-student-number"
                    className="block text-xs font-semibold text-slate-300 mb-1"
                  >
                    TUT Student Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-student-number"
                      type="text"
                      required
                      placeholder="e.g. 230099774"
                      value={resetStudentNumber}
                      onChange={(e) => setResetStudentNumber(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-token"
                    className="block text-xs font-semibold text-slate-300 mb-1"
                  >
                    6-Digit Reset Code / Token
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-token"
                      type="text"
                      required
                      maxLength={12}
                      placeholder="e.g. 583921"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="block text-xs font-semibold text-slate-300 mb-1"
                  >
                    New Student Password or PIN
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-new-password"
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      placeholder="Enter new password (min 4 characters)"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <button
                      type="button"
                      aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-semibold text-slate-300 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-confirm-password"
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      placeholder="Confirm new password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Saving New Password...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Update Password & Return to Sign In</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Request new code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setError('');
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
          Loading portal authentication...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

