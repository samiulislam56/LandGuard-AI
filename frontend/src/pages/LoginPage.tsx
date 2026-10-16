import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sparkles, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  User,
  Home
} from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  // Default mode: 'demo' or 'login' or 'signup'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1-Click Direct Demo Mutation
  const demoMutation = useMutation({
    mutationFn: () => api.demoLogin(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authMe'] });
      setSuccessMsg(isBn ? 'সরাসরি ডেমো মোডে সংযুক্ত হয়েছেন!' : 'Connected directly in Guest Demo Mode!');
      setTimeout(() => {
        navigate('/search');
      }, 700);
    },
    onError: () => {
      // Even if network fails, proceed directly
      navigate('/search');
    }
  });

  // Regular Institutional Login Mutation
  const loginMutation = useMutation({
    mutationFn: () => api.login(username, password),
    onSuccess: () => {
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['authMe'] });
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : (isBn ? 'লগইন ব্যর্থ হয়েছে। ইউজারনেম ও পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।' : 'Login failed. Check your username and password.'));
    }
  });

  // Mock User Signup with Instant Demo Redirect
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।' : 'Please provide username and password.');
      return;
    }
    // Grant immediate access
    demoMutation.mutate();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-md">
              LG
            </div>
            <span>LandGuard AI</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isBn ? "প্রবেশ ও ডেমো অ্যাক্সেস" : "Sign In & Demo Access"}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isBn 
              ? "জমির তথ্য ও লেনদেন যাচাইকরণ সিস্টেমে স্বাগতম"
              : "Welcome to the Land Information & Screening Platform"}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* DIRECT DEMO ACCESS CARD — 1-CLICK JOIN (NO SIGNUP OR LOGIN REQUIRED)    */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-5 shadow-xl shadow-emerald-900/20 border border-emerald-400/30">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              {isBn ? "সবার জন্য উন্মুক্ত ডেমো" : "Instant Public Demo"}
            </span>
            <span className="text-xs text-emerald-100 font-medium">
              {isBn ? "পাসওয়ার্ড বা সাইন আপ লাগবে না" : "No Password Needed"}
            </span>
          </div>

          <h2 className="text-lg font-bold leading-snug mb-1.5">
            {isBn 
              ? "লগইন বা সাইন আপ ছাড়াই সরাসরি ব্যবহার করুন"
              : "Direct Access Without Login or Sign Up"}
          </h2>
          
          <p className="text-xs text-emerald-100/90 leading-relaxed mb-4">
            {isBn
              ? "আপনি কোনো অ্যাকাউন্ট তৈরি না করেই অতিথি হিসেবে ৩,০০০ জমির খতিয়ান, দাগের ম্যাপ এবং এআই সহকারী সরাসরি ব্যবহার করতে পারবেন।"
              : "Explore 3,000 synthetic land parcels, cadastral diagrams, and AI assistance directly as a guest."}
          </p>

          <Button
            type="button"
            variant="secondary"
            className="w-full bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-sm py-2.5 shadow-md flex items-center justify-center gap-2 group transition-all"
            onClick={() => demoMutation.mutate()}
            isLoading={demoMutation.isPending}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              {isBn ? "১ ক্লিকে সরাসরি ডেমো শুরু করুন" : "Start Instant Guest Demo (1-Click)"}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          {successMsg && (
            <div className="mt-3 p-2 bg-emerald-900/60 border border-emerald-400/40 rounded-xl text-center text-xs font-semibold text-emerald-200 flex items-center justify-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-[#faf9f5] dark:bg-[#07130c] px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {isBn ? "অথবা প্রাতিষ্ঠানিক অ্যাকাউন্ট" : "OR INSTITUTIONAL ACCOUNT"}
          </span>
        </div>

        {/* Regular Sign In / Sign Up Card */}
        <Card className="p-6 bg-white dark:bg-slate-900/95 border-emerald-900/10 dark:border-emerald-500/20 shadow-lg">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              {isBn ? "লগইন (Sign In)" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {isBn ? "সাইন আপ (Sign Up)" : "Sign Up"}
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* Sign In Form */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? "ইউজারনেম বা ইমেইল" : "Username or Email"}
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isBn ? "যেমন: reviewer বা admin" : "e.g. reviewer or admin"}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? "পাসওয়ার্ড" : "Password"}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
                isLoading={loginMutation.isPending}
              >
                {isBn ? "লগইন করুন" : "Sign In to Workspace"}
              </Button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? "পূর্ণ নাম" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isBn ? "আপনার নাম লিখুন" : "Enter your name"}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? "ইউজারনেম বা ইমেইল" : "Username or Email"}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isBn ? "পছন্দের ইউজারনেম" : "Desired username"}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  required
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-normal">
                {isBn 
                  ? "দ্রষ্টব্য: এই ডেমো সিস্টেমে কোনো ব্যক্তিগত জাতীয় পরিচয়পত্র (NID) নম্বর গ্রহণ করা হয় না।"
                  : "Note: No real personal NID data is collected for this demonstration platform."}
              </p>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 font-bold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
                isLoading={demoMutation.isPending}
              >
                {isBn ? "অ্যাকাউন্ট তৈরি করে ডেমোতে প্রবেশ" : "Create Account & Enter Demo"}
              </Button>
            </form>
          )}

          {/* Quick Info Box */}
          <div className="mt-5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {isBn ? "ডেমো সুবিধা ও অনুমতি:" : "Demo Features & Scope:"}
            </span>
            <p>
              {isBn 
                ? "অতিথি ডেমো ব্যবহারকারী হিসেবে আপনি সকল জমির তথ্য অনুসন্ধান, ক্যাডাস্ট্রাল ম্যাপ, লেনদেন যাচাই ও এআই সহকারীর সাহায্য নিতে পারবেন।"
                : "Guest demo users have complete read access to search parcels, view khasra maps, inspect transactions, and ask the AI Copilot."}
            </p>
          </div>

        </Card>

        {/* Back to Home Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isBn ? "মূল পাতায় ফিরে যান" : "Back to Home Page"}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
