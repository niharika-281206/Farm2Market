import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wheat, ShieldCheck, Lock, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('operator@example.com');
  const [password, setPassword] = useState<string>('Operator@2026');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification State
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both Email and Password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password.trim());
    } catch (err: any) {
      if (err.response?.data?.detail === 'unverified_email') {
        setIsVerifying(true);
        setError(null);
        handleResendCode();
        return;
      }
      const msg = err.response?.data?.detail || err.message || 'Invalid operator credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/operator/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: verificationCode })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed');
      
      // If verification succeeds, retry login
      await login(email.trim(), password.trim());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/operator/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('operator@example.com');
    setPassword('Operator@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold shadow-lg mb-4 glow-emerald">
            <Wheat className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white font-display tracking-tight">
            Procurement Centre Portal
          </h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mt-1">
            SIH 2026 • Problem Statement 26032
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized Operator Session</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Render Verification Form or Login Form */}
        {isVerifying ? (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-white font-bold mb-2">Verify Your Email</h3>
              <p className="text-slate-400 text-sm">We sent a verification code to:<br/><span className="text-emerald-400 font-mono">{email}</span></p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Enter 6-digit code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                required
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-center text-xl tracking-[0.5em] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg glow-emerald transition-all flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Operator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. operator@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg glow-emerald transition-all flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>LOGIN TO OPERATOR DESK</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Demo Preset Credentials Loader */}
        {!isVerifying && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              Fill Demo Operator Credentials
            </button>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-slate-500 text-xs">
        <p>Smart Procurement Centre Queue Management System • SIH 2026</p>
      </footer>
    </div>
  );
};
