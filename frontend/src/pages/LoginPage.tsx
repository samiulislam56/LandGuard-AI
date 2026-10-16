import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Leaf,
  User,
  Mail,
  Users,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Home
} from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Mode: 'signup' (Join LandGuard) or 'login' (Sign In)
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>(initialMode);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Farmer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1-Click Direct Secure Access Mutation
  const secureAccessMutation = useMutation({
    mutationFn: () => api.demoLogin(),
    onSuccess: () => {
      localStorage.setItem('landguard_has_entered', 'true');
      queryClient.invalidateQueries({ queryKey: ['authMe'] });
      setSuccessMsg(isBn ? 'সরাসরি সিকিউর অ্যাক্সেসে প্রবেশ করছেন...' : 'Entering via Secure Access...');
      setTimeout(() => {
        navigate('/home');
      }, 500);
    },
    onError: () => {
      localStorage.setItem('landguard_has_entered', 'true');
      navigate('/home');
    }
  });

  // Regular Institutional Login Mutation
  const loginMutation = useMutation({
    mutationFn: () => api.login(username, password),
    onSuccess: () => {
      localStorage.setItem('landguard_has_entered', 'true');
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['authMe'] });
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : (isBn ? 'লগইন ব্যর্থ হয়েছে। ইউজারনেম ও পাসওয়ার্ড পরীক্ষা করুন।' : 'Login failed. Check your credentials.'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'login') {
      if (!username.trim() || !password.trim()) {
        setErrorMsg(isBn ? 'ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন।' : 'Please enter username and password.');
        return;
      }
      loginMutation.mutate();
    } else {
      if (username.trim().length < 3) {
        setErrorMsg(isBn ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' : 'Username must be at least 3 characters.');
        return;
      }
      if (password.length < 8) {
        setErrorMsg(isBn ? 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' : 'Password must be at least 8 characters.');
        return;
      }
      // Direct success for signup in demo platform
      secureAccessMutation.mutate();
    }
  };

  const handleDirectSecureAccess = () => {
    secureAccessMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf7f0] via-[#f2faf5] to-[#e4f5eb] dark:from-[#07140e] dark:via-[#0b1c13] dark:to-[#08170f] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden select-none">
      
      {/* Soft Mint Blur Glows (Exact match with screenshot aesthetic) */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-400/25 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-300/25 dark:bg-teal-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        
        {/* Main Card (Matches uploaded screenshot) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-emerald-950/10 dark:shadow-black/40 border border-emerald-100 dark:border-emerald-900/40 p-7 sm:p-9">
          
          {/* Top Green Leaf Badge */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 mx-auto mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d7a46] dark:text-emerald-400 tracking-tight">
              {activeTab === 'signup' ? "Join LandGuard" : "Welcome Back"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {isBn 
                ? "কৃত্রিম বুদ্ধিমত্তার সাহায্যে জমির তথ্য ও অসংগতি যাচাই শুরু করুন"
                : "Start monitoring land health with AI today"}
            </p>
          </div>

          {/* Tab Selector (Join / Login) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all text-center ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-[#0d7a46] dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isBn ? "নিবন্ধন (Sign Up)" : "Register"}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all text-center ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-[#0d7a46] dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isBn ? "লগইন (Sign In)" : "Sign In"}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username *
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-xs"
                  required
                />
              </div>
              {activeTab === 'signup' && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Minimum 3 characters
                </span>
              )}
            </div>

            {/* Email Address Input (Visible in signup mode) */}
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Your Role Dropdown (Visible in signup mode - exact match with screenshot) */}
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Role *
                </label>
                <div className="relative flex items-center">
                  <Users className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-8 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-xs appearance-none cursor-pointer"
                  >
                    <option value="Farmer">🧑‍🌾 Farmer (কৃষক)</option>
                    <option value="Land Owner">🏡 Land Owner (জমির মালিক)</option>
                    <option value="Researcher">🔍 Researcher (গবেষক)</option>
                    <option value="Reviewer">⚖️ Reviewer / Auditor (পর্যালোচক)</option>
                    <option value="Citizen">👤 General Citizen (সাধারণ নাগরিক)</option>
                  </select>
                  <div className="absolute right-3.5 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
            )}

            {/* Password Input (with Eye toggle) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                Minimum 8 characters
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 bg-[#0d7a46] hover:bg-[#0a6338] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all mt-2"
              isLoading={loginMutation.isPending || secureAccessMutation.isPending}
            >
              {activeTab === 'signup' 
                ? (isBn ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account")
                : (isBn ? "লগইন করুন" : "Sign In")}
            </Button>
          </form>

          {/* ========================================================================= */}
          {/* USER REQUIREMENT: ALADA SECURE ACCESS SECTION (NO LOGIN/SIGNUP NEEDED)    */}
          {/* ========================================================================= */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-slate-800/80 dark:to-emerald-950/40 border border-emerald-300/80 dark:border-emerald-700/60 p-4 text-center space-y-2.5 shadow-sm">
              
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{isBn ? "সিকিউর অ্যাক্সেস" : "Secure Access"}</span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {isBn 
                  ? "লগইন বা সাইন আপ ছাড়াই ১-ক্লিকে সরাসরি সম্পূর্ণ প্ল্যাটফর্মে প্রবেশ করুন।"
                  : "Join and explore the entire platform directly without login or sign up."}
              </p>

              <Button
                type="button"
                variant="primary"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 group transition-all"
                onClick={handleDirectSecureAccess}
                isLoading={secureAccessMutation.isPending}
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>
                  {isBn ? "Secure Access — সরাসরি প্রবেশ করুন" : "Secure Access — Enter Directly"}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

        </div>

        {/* Back to Home / Direct Navigation link */}
        <div className="text-center mt-5">
          <Link
            to="/home"
            onClick={() => localStorage.setItem('landguard_has_entered', 'true')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isBn ? "সরাসরি ওয়েবসাইটে যান" : "Go to Main Website"}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
