import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShoppingBag, Mail, Lock, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import api from '../api/axios';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 409) {
        // Pin the error directly on the email field — feels like native validation
        setError('email', {
          type: 'server',
          message: 'This email is already registered. Try signing in instead.',
        });
      } else if (typeof msg === 'string') {
        setServerError(msg);
      } else if (Array.isArray(msg)) {
        setServerError(msg[0]);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex flex-col relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Abstract Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Top bar — Glassmorphic */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-md border-b border-white/5 py-5 px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all">
            <ShoppingBag className="w-5 h-5 text-white drop-shadow-md" />
          </div>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            nexShop
          </span>
        </Link>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

      {/* Form card container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_80px_-20px_rgba(79,70,229,0.3)] p-10 relative overflow-hidden">

            {/* Inner subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Icon badge */}
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
                <UserPlus className="w-6 h-6 text-white" />
              </div>

              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h1>
              <p className="text-slate-400 text-sm mb-8 font-light">
                Join nexShop and start shopping today.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="off"
                      className={`w-full bg-[#060913] border ${errors.email ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner`}
                      placeholder="you@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      className={`w-full bg-[#060913] border ${errors.password ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner`}
                      placeholder="Min. 6 characters"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      id="register-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      className={`w-full bg-[#060913] border ${errors.confirmPassword ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner`}
                      placeholder="Repeat your password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Generic server error (non-409) */}
                {serverError && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-5 py-3.5">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {serverError}
                  </div>
                )}

                {/* Submit */}
                <button
                  id="register-btn"
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-extrabold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] mt-4"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>

                {/* Link to login */}
                <p className="text-center text-sm text-slate-500 pt-2">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8 pb-8 text-xs text-slate-500 font-medium">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Help</span>
          </div>
        </div>
      </div>
    </div>
  );
}
