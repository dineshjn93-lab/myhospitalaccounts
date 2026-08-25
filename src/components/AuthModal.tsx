import React, { useState } from 'react';
import {
  Shield,
  Building2,
  Lock,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  X,
  Sparkles,
  ArrowRight,
  Wallet,
  Landmark,
  FileCheck2,
  Chrome,
} from 'lucide-react';
import { AppUser, HospitalSettings, UserRole } from '../types/hospital';
import { AuthService, defaultSeedUsers } from '../services/authService';
import { requestGoogleAccessToken, fetchGoogleUserProfile } from '../services/googleSheetsService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form State - Step 1: User Account
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('Medical Superintendent');
  const [signupPhone, setSignupPhone] = useState('');

  // Signup Form State - Step 2: Hospital Master Settings
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    hospitalName: '',
    departmentName: 'DEPARTMENT OF HEALTH & FAMILY WELFARE',
    district: '',
    state: 'STATE GOVERNMENT',
    registrationNo: '',
    financialYear: '2026-2027',
    openingCashBalance: 250000,
    openingPettyCashBalance: 25000,
    bankOpeningBalance: 4500000,
    currencySymbol: '₹',
    medicalSuperintendent: '',
    seniorAccountant: '',
    internalAuditor: '',
  });

  if (!isOpen) return null;

  // Google OAuth Sign In & Auto Register
  const handleGoogleOAuthSignIn = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    try {
      const token = await requestGoogleAccessToken();
      const userProfile = await fetchGoogleUserProfile(token);
      
      const res = AuthService.handleGoogleAuthUser({
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        role: 'Medical Superintendent',
      });

      if (res.success && res.user) {
        setSuccessMsg(`Signed in with Google as ${res.user.fullName}!`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.error || 'Failed to authenticate with Google account.');
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMsg(err.message || 'Google Sign-In was cancelled or failed. Please check permissions.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Quick autofill demo accounts
  const handleQuickDemoLogin = (user: AppUser) => {
    setLoginIdentifier(user.username);
    setLoginPassword(user.password || 'password123');
    setErrorMsg(null);
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.login(loginIdentifier, loginPassword);
      setIsLoading(false);
      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.fullName}!`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    }, 250);
  };

  // Handle Signup Validation & Step Transitions
  const handleNextToHospitalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupFullName.trim()) {
      setErrorMsg('Please enter your Full Name / Officer Name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid Official Email address.');
      return;
    }
    if (!signupUsername.trim()) {
      setErrorMsg('Please choose a Username for login.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    // Auto-fill Superintendent/Officer in settings if blank
    setHospitalSettings((prev) => ({
      ...prev,
      medicalSuperintendent: prev.medicalSuperintendent || signupFullName,
    }));

    setSignupStep(2);
  };

  // Handle Complete Signup Submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hospitalSettings.hospitalName.trim()) {
      setErrorMsg('Hospital Master Setting: Hospital Name is mandatory.');
      return;
    }
    if (!hospitalSettings.departmentName.trim()) {
      setErrorMsg('Hospital Master Setting: Department Name is mandatory.');
      return;
    }
    if (!hospitalSettings.district.trim()) {
      setErrorMsg('Hospital Master Setting: District is mandatory.');
      return;
    }
    if (!hospitalSettings.state.trim()) {
      setErrorMsg('Hospital Master Setting: State is mandatory.');
      return;
    }
    if (!hospitalSettings.registrationNo.trim()) {
      setErrorMsg('Hospital Master Setting: Registration / DDO Code is mandatory.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.signup({
        fullName: signupFullName,
        email: signupEmail,
        username: signupUsername,
        password: signupPassword,
        role: signupRole,
        phone: signupPhone,
        hospitalSettings: {
          ...hospitalSettings,
          medicalSuperintendent: hospitalSettings.medicalSuperintendent || signupFullName,
          seniorAccountant: hospitalSettings.seniorAccountant || 'Senior Accounts Officer',
          internalAuditor: hospitalSettings.internalAuditor || 'Internal Auditor / CA',
        },
      });

      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`Account created & Hospital Profile initialized successfully!`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMsg(res.error || 'Failed to create account. Please check your information.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-400/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  {mode === 'login' ? 'Official Hospital Accounts Login' : 'New User & Hospital Registration'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded-full">
                  Govt. Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login'
                  ? 'Access hospital cash book, procurement registers & deduction reports'
                  : 'Create your officer credentials and configure the Hospital Master Settings'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              mode === 'login'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Hospital Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignupStep(1);
              setErrorMsg(null);
            }}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              mode === 'signup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up + Hospital Master Setup</span>
          </button>
        </div>

        {/* Alerts / Error & Success banners */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {mode === 'login' && (
          <div className="p-6 space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username or Official Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. drsharma or ms.hospital@gov.in"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span>Keep session active</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setSignupStep(1);
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Create New Hospital Account
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In & Open Hospital Ledger</span>
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Login Button */}
              <button
                type="button"
                onClick={handleGoogleOAuthSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2.5 hover:border-slate-400 cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <span className="text-xs text-slate-500">Connecting with Google OAuth...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google (OAuth 2.0)</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Accounts */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Demo Accounts (1-Click Test Login):</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {defaultSeedUsers.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(u)}
                    className="p-2.5 text-left border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                        {u.fullName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                        {u.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{u.role}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SIGNUP FORM (WITH MANDATORY HOSPITAL MASTER SETTINGS) */}
        {mode === 'signup' && (
          <div className="p-6">
            {/* Step Indicator Header */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSignupStep(1)}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    signupStep === 1
                      ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>User Account & Officer Profile</span>
                </button>

                <ArrowRight className="w-4 h-4 text-slate-400" />

                <button
                  type="button"
                  onClick={() => setSignupStep(2)}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    signupStep === 2
                      ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Hospital Master Settings (Required)</span>
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium">Step {signupStep} of 2</span>
            </div>

            {/* STEP 1: USER CREDENTIALS */}
            {signupStep === 1 && (
              <form onSubmit={handleNextToHospitalSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name / Officer Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Rajesh K. Sharma"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Official Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. ms.hospital@gov.in"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. drsharma_ms"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Designation / Officer Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    >
                      <option value="Medical Superintendent">Medical Superintendent</option>
                      <option value="Senior Accountant / DDO">Senior Accountant / DDO</option>
                      <option value="Internal Auditor">Internal Auditor</option>
                      <option value="Accountant / Cashier">Accountant / Cashier</option>
                      <option value="Hospital Administrator">Hospital Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimum 4 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Contact / Mobile No.
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleGoogleOAuthSignIn}
                    disabled={isGoogleLoading}
                    className="py-2 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Instant Sign up with Google</span>
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Step 2: Hospital Master Settings</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: HOSPITAL MASTER SETTINGS */}
            {signupStep === 2 && (
              <form onSubmit={handleSignupSubmit} className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs mb-3">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Mandatory Hospital Master Setup:</strong> These institutional settings will be configured for your new account and printed on all vouchers, cash books, and registers.
                  </span>
                </div>

                {/* Section A: Institution Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                    A. Institutional Identity & Location
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hospital / Institution Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DISTRICT HEADQUARTERS GOVERNMENT HOSPITAL"
                      value={hospitalSettings.hospitalName}
                      onChange={(e) =>
                        setHospitalSettings({ ...hospitalSettings, hospitalName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Department / Ministry <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={hospitalSettings.departmentName}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, departmentName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Registration / DDO Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HOSP/GOVT/2026/0192"
                        value={hospitalSettings.registrationNo}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, registrationNo: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Central District"
                        value={hospitalSettings.district}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, district: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={hospitalSettings.state}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, state: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Financial Year <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={hospitalSettings.financialYear}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, financialYear: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Opening Balances */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>B. Financial Opening Balances (As on April 1st)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Main Cash Book Opening (₹)
                      </label>
                      <input
                        type="number"
                        value={hospitalSettings.openingCashBalance}
                        onChange={(e) =>
                          setHospitalSettings({
                            ...hospitalSettings,
                            openingCashBalance: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Petty Cash Opening (₹)
                      </label>
                      <input
                        type="number"
                        value={hospitalSettings.openingPettyCashBalance}
                        onChange={(e) =>
                          setHospitalSettings({
                            ...hospitalSettings,
                            openingPettyCashBalance: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Bank Opening Balance (₹)
                      </label>
                      <input
                        type="number"
                        value={hospitalSettings.bankOpeningBalance}
                        onChange={(e) =>
                          setHospitalSettings({
                            ...hospitalSettings,
                            bankOpeningBalance: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold text-blue-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Official Signatories */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>C. Official Signatories for Vouchers & Registers</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Medical Superintendent / DDO
                      </label>
                      <input
                        type="text"
                        value={hospitalSettings.medicalSuperintendent}
                        onChange={(e) =>
                          setHospitalSettings({
                            ...hospitalSettings,
                            medicalSuperintendent: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Senior Accountant / Cashier
                      </label>
                      <input
                        type="text"
                        value={hospitalSettings.seniorAccountant}
                        onChange={(e) =>
                          setHospitalSettings({
                            ...hospitalSettings,
                            seniorAccountant: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Internal Auditor / CA
                      </label>
                      <input
                        type="text"
                        value={hospitalSettings.internalAuditor}
                        onChange={(e) =>
                          setHospitalSettings({
                            ...hospitalSettings,
                            internalAuditor: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    ← Back to Step 1
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Initializing Account & Hospital Profile...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Sign Up & Launch Hospital Portal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
